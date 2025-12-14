"use server";

import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    throw new Error("Not authorized");
  }

  return session.user.id;
}

// Create new location
export async function createLocation(data: {
  name: string;
  address: string;
  city: string;
  description?: string;
  capacity?: number;
  court_count?: number;
  price_per_game?: number;
}) {
  try {
    await checkAdminAccess();

    const location = await prisma.locations.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        description: data.description,
        capacity: data.capacity,
        court_count: data.court_count || 1,
        price_per_game: data.price_per_game,
        is_active: true,
      },
    });

    revalidatePath("/dashboard/locations");

    return {
      success: true,
      message: "Location created successfully",
      location,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create location",
    };
  }
}

// Update location
export async function updateLocation(
  locationId: number,
  data: {
    name?: string;
    address?: string;
    city?: string;
    description?: string;
    capacity?: number;
    court_count?: number;
    price_per_game?: number;
    image_url?: string;
  },
) {
  try {
    await checkAdminAccess();

    const location = await prisma.locations.update({
      where: { id: locationId },
      data,
    });

    revalidatePath("/dashboard/locations");

    return {
      success: true,
      message: "Location updated successfully",
      location,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update location",
    };
  }
}

// Activate/Deactivate location
export async function toggleLocationActive(locationId: number) {
  try {
    await checkAdminAccess();

    // Get current status
    const location = await prisma.locations.findUnique({
      where: { id: locationId },
      select: { is_active: true, name: true },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    // Toggle status
    const updated = await prisma.locations.update({
      where: { id: locationId },
      data: { is_active: !location.is_active },
    });

    revalidatePath("/dashboard/locations");

    return {
      success: true,
      message: `Location ${updated.is_active ? "activated" : "deactivated"} successfully`,
      location: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to toggle location status",
    };
  }
}

// Delete location (only if no games scheduled)
export async function deleteLocation(locationId: number) {
  try {
    await checkAdminAccess();

    // Check if location has any scheduled games
    const scheduledGames = await prisma.games.count({
      where: {
        location_id: locationId,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
      },
    });

    if (scheduledGames > 0) {
      return {
        success: false,
        message: `Cannot delete location. ${scheduledGames} game(s) are scheduled at this location.`,
      };
    }

    // Check if location has any games at all
    const totalGames = await prisma.games.count({
      where: { location_id: locationId },
    });

    if (totalGames > 0) {
      // Has past games, ask for confirmation
      return {
        success: false,
        message: `This location has ${totalGames} game(s) in history. Consider deactivating instead of deleting.`,
        requiresConfirmation: true,
      };
    }

    // Safe to delete
    await prisma.locations.delete({
      where: { id: locationId },
    });

    revalidatePath("/dashboard/locations");

    return {
      success: true,
      message: "Location deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete location",
    };
  }
}

// Force delete location (with confirmation)
export async function forceDeleteLocation(locationId: number) {
  try {
    await checkAdminAccess();

    // Check for scheduled games
    const scheduledGames = await prisma.games.count({
      where: {
        location_id: locationId,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
      },
    });

    if (scheduledGames > 0) {
      return {
        success: false,
        message: `Cannot delete location. ${scheduledGames} game(s) are still scheduled.`,
      };
    }

    await prisma.locations.delete({
      where: { id: locationId },
    });

    revalidatePath("/dashboard/locations");

    return {
      success: true,
      message: "Location deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete location",
    };
  }
}

// Get all locations for admin (with search, filter, and pagination)
export async function getAllLocationsForAdmin(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    search?: string;
    city?: string;
    isActive?: "all" | "active" | "inactive";
  }
) {
  try {
    await checkAdminAccess();

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.isActive && filters.isActive !== "all") {
      where.is_active = filters.isActive === "active";
    }

    const [locations, totalLocations, cities] = await prisma.$transaction([
      prisma.locations.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: {
              games: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.locations.count({ where }),
      prisma.locations.findMany({
        select: {
          city: true,
        },
        distinct: ["city"],
        orderBy: {
          city: "asc",
        },
      }),
    ]);

    return {
      success: true,
      locations,
      totalLocations,
      page,
      pageSize,
      cities: cities.map((c) => c.city),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch locations",
      locations: [],
      totalLocations: 0,
      page,
      pageSize,
      cities: [],
    };
  }
}

// Get location with games
export async function getLocationWithGames(locationId: number) {
  try {
    await checkAdminAccess();

    const location = await prisma.locations.findUnique({
      where: { id: locationId },
      include: {
        games: {
          include: {
            _count: {
              select: {
                game_registrations: {
                  where: { status: "CONFIRMED" },
                },
              },
            },
          },
          orderBy: {
            game_date: "desc",
          },
          take: 10,
        },
      },
    });

    if (!location) {
      return {
        success: false,
        message: "Location not found",
      };
    }

    return {
      success: true,
      location,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch location",
    };
  }
}
