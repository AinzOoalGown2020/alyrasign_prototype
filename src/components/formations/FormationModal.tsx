import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'

interface FormationFormData {
  title: string
  description: string
  startDate: string
  endDate: string
}

interface FormationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormationFormData) => void
  initialData?: FormationFormData
  mode: 'create' | 'edit'
}

export function FormationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: FormationModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormationFormData>({
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
                  {mode === 'create' ? 'Créer une Formation' : 'Modifier la Formation'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title', { required: 'Le titre est requis' })}
                      className="input mt-1"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...register('description', { required: 'La description est requise' })}
                      className="input mt-1"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Date de début
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        {...register('startDate', { required: 'La date de début est requise' })}
                        className="input mt-1"
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        {...register('endDate', { required: 'La date de fin est requise' })}
                        className="input mt-1"
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                      )}
                    </div>
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
                      {mode === 'create' ? 'Créer' : 'Modifier'}
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