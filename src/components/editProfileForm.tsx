'use client'
import { useState, useEffect } from 'react'
import Form from 'next/form'
import { Button } from '@/components/ui/button'
import { updateUserForm } from '@/actions/userActions'
import { useProfileContext } from '@/context/profileContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Pencil, X } from 'lucide-react'

export default function EditProfileForm() {
  const { user, updateUser } = useProfileContext()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSubmit = async (formData: FormData) => {
    const response = await updateUserForm(formData)
    if (response.success) {
      updateUser(response.updatedUser)
      toast.success(response.message)
      setIsOpen(false)
    } else {
      toast.error(response.message)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="text-zinc-500 transition-colors hover:text-basket-400 dark:text-zinc-400 dark:hover:text-basket-400"
      >
        <Pencil className="mr-1.5 h-3.5 w-3.5" />
        Edit profile
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-[425px] rounded-lg border border-zinc-200 bg-zinc-50 p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <div className="mb-4 flex flex-col gap-1.5">
              <h2 className="text-sm font-medium">Edit profile</h2>
              <p className="text-[13px] text-zinc-400">Make changes to your profile. Click save when you&apos;re done.</p>
            </div>

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
              <div className="flex justify-end">
                <Button type="submit" className="bg-basket-400 text-white hover:bg-basket-300">
                  Save changes
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  )
}
