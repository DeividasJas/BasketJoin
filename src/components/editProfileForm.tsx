"use client";
import Form from "next/form";
import { updateUserForm } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileContext } from "@/context/profileContext";

export default function EditProfileForm() {
  const { user } = useProfileContext();
  // const user = await getCurrentUser();

  // console.log(11111, user);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-zinc-500">
            Edit Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-600 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you re done.
            </DialogDescription>
          </DialogHeader>

          <Form action={updateUserForm}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="givenName"
                  name="givenName"
                  defaultValue={user?.givenName}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastname" className="text-right">
                  Family Name
                </Label>
                <Input
                  id="familyName"
                  name="familyName"
                  defaultValue={user?.familyName}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user?.username || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  Phone number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  defaultValue={user?.phoneNumber || ""}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
