'use client'
import Form from 'next/form'
import { Button } from '@/components/ui/button'
import { updateUserForm } from '@/actions/userActions'
import { useProfileContext } from '@/context/profileContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

export default function EditProfileForm() {
  const { user, updateUser } = useProfileContext()

  const handleSubmit: any = async (formData: FormData) => {
    const response = await updateUserForm(formData)
    if (response.success) {
      updateUser(response.updatedUser)
      toast.success(response.message)
    } else {
      toast.error(response.message)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-zinc-500 transition-colors hover:text-basket-400 dark:text-zinc-400 dark:hover:text-basket-400">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">Edit profile</DialogTitle>
          <DialogDescription className="text-[13px] text-zinc-400">Make changes to your profile. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>

        <Form action={handleSubmit}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="givenName" className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                First name
              </Label>
              <Input
                id="givenName"
                name="givenName"
                defaultValue={user?.given_name || ''}
                className="border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="familyName" className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                Last name
              </Label>
              <Input
                id="familyName"
                name="familyName"
                defaultValue={user?.family_name || ''}
                className="border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                defaultValue={user?.username || ''}
                className="border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phoneNumber" className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                Phone number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={user?.phone_number || ''}
                className="border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-basket-400 text-white hover:bg-basket-300">
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
