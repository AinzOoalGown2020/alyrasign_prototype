import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import { EtudiantInput } from '@/hooks/useEtudiants'

interface EtudiantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EtudiantInput) => void
  initialData?: EtudiantInput
  mode: 'create' | 'edit'
}

export function EtudiantModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: EtudiantModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EtudiantInput>({
    defaultValues: initialData,
  })

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {mode === 'create' ? 'Ajouter un Étudiant' : 'Modifier un Étudiant'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                      Adresse du Wallet
                    </label>
                    <input
                      type="text"
                      id="walletAddress"
                      {...register('walletAddress', { required: "L'adresse du wallet est requise" })}
                      className="input mt-1"
                      placeholder="Entrez l'adresse du wallet"
                    />
                    {errors.walletAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.walletAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle
                    </label>
                    <select
                      id="role"
                      {...register('role', { required: 'Le rôle est requis' })}
                      className="input mt-1"
                    >
                      <option value="etudiant">Étudiant</option>
                      <option value="formateur">Formateur</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {mode === 'create' ? 'Ajouter' : 'Modifier'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 