"use server";

import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import {
  MembershipStatus,
  PaymentScheduleStatus,
  SeasonStatus,
} from "@prisma/client";
import type { CreateMembershipResult } from "@/types/prismaTypes";
import {
  calculateProRatedAmount,
  createPaymentSchedules,
} from "@/lib/paymentUtils";

/**
 * Join a series (create membership for active or upcoming season)
 */
export async function joinSeries(
  seriesId: string,
  userId?: string,
): Promise<CreateMembershipResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    const memberId = userId || session.user.id;

    // If admin is adding someone else, verify admin role
    if (userId && userId !== session.user.id) {
      const adminUser = await prisma.users.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (adminUser?.role !== "ADMIN") {
        return { success: false, message: "Admin access required" };
      }
    }

    // Find active or upcoming season for this series
    const season = await prisma.league.findFirst({
      where: {
        series_id: seriesId,
        status: { in: [SeasonStatus.ACTIVE, SeasonStatus.UPCOMING] },
      },
      orderBy: { start_date: "asc" },
    });

    if (!season) {
      return {
        success: false,
        message: "No active or upcoming season found for this series",
      };
    }

    // Check if user is already a member
    const existingMembership = await prisma.seriesMembership.findUnique({
      where: {
        user_id_series_id_season_id: {
          user_id: memberId,
          series_id: seriesId,
          season_id: season.id,
        },
      },
    });

    if (existingMembership) {
      return {
        success: false,
        message: "You are already a member of this series for this season",
      };
    }

    // Parse payment due dates
    const paymentDueDates: string[] = JSON.parse(season.payment_due_dates);

    // Calculate pro-rated amount
    const joinDate = new Date();
    const proRatedAmount = calculateProRatedAmount(
      season.gym_rental_cost,
      season.start_date,
      season.end_date,
      joinDate,
      paymentDueDates,
    );

    // Create membership
    const membership = await prisma.seriesMembership.create({
      data: {
        user_id: memberId,
        series_id: seriesId,
        season_id: season.id,
        status: MembershipStatus.ACTIVE,
        pro_rated_amount: proRatedAmount.totalAmount,
      },
      include: {
        user: true,
        series: true,
        season: true,
        payment_schedules: true,
        payments: true,
      },
    });

    // Create payment schedules for remaining due dates
    await createPaymentSchedules(
      membership.id,
      season.id,
      proRatedAmount.schedules,
    );

    // Auto-register member for all future games in this series
    const futureGames = await prisma.games.findMany({
      where: {
        series_id: seriesId,
        game_date: { gte: new Date() },
        status: "SCHEDULED",
      },
    });

    if (futureGames.length > 0) {
      await prisma.game_registrations.createMany({
        data: futureGames.map((game) => ({
          user_id: memberId,
          game_id: game.id,
          status: "CONFIRMED",
          registration_type: "MEMBER",
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath("/dashboard/memberships");
    revalidatePath(`/series/${seriesId}`);
    revalidatePath("/profile/memberships");

    return {
      success: true,
      message: `Successfully joined series! Your pro-rated fee is €${proRatedAmount.totalAmount / 100}`,
      membership,
    };
  } catch (error) {
    console.error("Error joining series:", error);
    return {
      success: false,
      message: "Failed to join series. Please try again.",
    };
  }
}

/**
 * Cancel a membership
 */
export async function cancelMembership(
  membershipId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    const membership = await prisma.seriesMembership.findUnique({
      where: { id: membershipId },
      include: {
        season: true,
        payment_schedules: true,
      },
    });

    if (!membership) {
      return { success: false, message: "Membership not found" };
    }

    // Only allow user to cancel their own membership, or admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (membership.user_id !== session.user.id && user?.role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

    // Don't allow cancelling if season is completed
    if (membership.season.status === SeasonStatus.COMPLETED) {
      return {
        success: false,
        message: "Cannot cancel membership for completed leagues",
      };
    }

    // Check if there are any paid payment schedules
    const paidSchedules = membership.payment_schedules.filter(
      (schedule) => schedule.status === PaymentScheduleStatus.PAID,
    );

    if (paidSchedules.length > 0) {
      return {
        success: false,
        message:
          "Cannot cancel membership with paid installments. Please contact admin for refund.",
      };
    }

    // Update membership status
    await prisma.seriesMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.CANCELLED },
    });

    // Update game registrations to GUEST type
    await prisma.game_registrations.updateMany({
      where: {
        user_id: membership.user_id,
        game: {
          series_id: membership.series_id,
          game_date: { gte: new Date() },
        },
        registration_type: "MEMBER",
      },
      data: {
        registration_type: "GUEST",
        guest_fee_paid: false,
      },
    });

    revalidatePath("/dashboard/memberships");
    revalidatePath(`/series/${membership.series_id}`);
    revalidatePath("/profile/memberships");

    return {
      success: true,
      message: `Membership cancelled successfully${reason ? `: ${reason}` : ""}`,
    };
  } catch (error) {
    console.error("Error cancelling membership:", error);
    return {
      success: false,
      message: "Failed to cancel membership. Please try again.",
    };
  }
}

/**
 * Reactivate a cancelled membership
 */
export async function reactivateMembership(
  membershipId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Authentication required" };
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, message: "Admin access required" };
    }

    const membership = await prisma.seriesMembership.findUnique({
      where: { id: membershipId },
      include: { season: true },
    });

    if (!membership) {
      return { success: false, message: "Membership not found" };
    }

    if (membership.status !== MembershipStatus.CANCELLED) {
      return {
        success: false,
        message: "Only cancelled memberships can be reactivated",
      };
    }

    if (membership.season.status === SeasonStatus.COMPLETED) {
      return {
        success: false,
        message: "Cannot reactivate membership for completed leagues",
      };
    }

    await prisma.seriesMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.ACTIVE },
    });

    // Restore game registrations to MEMBER type
    await prisma.game_registrations.updateMany({
      where: {
        user_id: membership.user_id,
        game: {
          series_id: membership.series_id,
          game_date: { gte: new Date() },
        },
      },
      data: {
        registration_type: "MEMBER",
        guest_fee_paid: false,
      },
    });

    revalidatePath("/dashboard/memberships");
    revalidatePath(`/series/${membership.series_id}`);

    return {
      success: true,
      message: "Membership reactivated successfully",
    };
  } catch (error) {
    console.error("Error reactivating membership:", error);
    return {
      success: false,
      message: "Failed to reactivate membership. Please try again.",
    };
  }
}

/**
 * Get all memberships for a user
 */
export async function getUserMemberships(userId?: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        memberships: [],
        message: "Authentication required",
      };
    }

    const targetUserId = userId || session.user.id;

    // If fetching for another user, verify admin role
    if (userId && userId !== session.user.id) {
      const user = await prisma.users.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        return {
          success: false,
          memberships: [],
          message: "Admin access required",
        };
      }
    }

    const memberships = await prisma.seriesMembership.findMany({
      where: { user_id: targetUserId },
      include: {
        series: true,
        season: true,
        payment_schedules: {
          orderBy: { due_date: "asc" },
        },
        payments: {
          orderBy: { payment_date: "desc" },
        },
      },
      orderBy: { joined_at: "desc" },
    });

    return { success: true, memberships };
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return {
      success: false,
      memberships: [],
      message: "Failed to fetch memberships",
    };
  }
}

/**
 * Get all memberships for a season
 */
export async function getSeasonMemberships(seasonId: string) {
  try {
    const memberships = await prisma.seriesMembership.findMany({
      where: { season_id: seasonId },
      include: {
        user: {
          select: {
            id: true,
            given_name: true,
            family_name: true,
            email: true,
          },
        },
        series: true,
        season: true,
        payment_schedules: {
          orderBy: { due_date: "asc" },
        },
        _count: {
          select: {
            payments: true,
            payment_schedules: true,
          },
        },
      },
      orderBy: { joined_at: "asc" },
    });

    return { success: true, memberships };
  } catch (error) {
    console.error("Error fetching season memberships:", error);
    return {
      success: false,
      memberships: [],
      message: "Failed to fetch memberships",
    };
  }
}

/**
 * Check if user is member of a series for current/upcoming season
 */
export async function checkSeriesMembership(
  userId: string,
  seriesId: string,
): Promise<{ isMember: boolean; membership?: any }> {
  try {
    const activeSeason = await prisma.league.findFirst({
      where: {
        series_id: seriesId,
        status: { in: [SeasonStatus.ACTIVE, SeasonStatus.UPCOMING] },
      },
      orderBy: { start_date: "asc" },
    });

    if (!activeSeason) {
      return { isMember: false };
    }

    const membership = await prisma.seriesMembership.findUnique({
      where: {
        user_id_series_id_season_id: {
          user_id: userId,
          series_id: seriesId,
          season_id: activeSeason.id,
        },
      },
      include: {
        season: true,
        payment_schedules: true,
      },
    });

    return {
      isMember: membership?.status === MembershipStatus.ACTIVE,
      membership,
    };
  } catch (error) {
    console.error("Error checking membership:", error);
    return { isMember: false };
  }
}
