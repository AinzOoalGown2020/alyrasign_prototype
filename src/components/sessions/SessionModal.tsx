import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'

interface SessionFormData {
  title: string
  date: string
  startTime: string
  endTime: string
}

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SessionFormData) => void
  initialData?: SessionFormData
  formationId: string
  mode: 'create' | 'edit'
}

export function SessionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  formationId,
  mode,
}: SessionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionFormData>({
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
                  {mode === 'create' ? 'Créer une Session' : 'Modifier la Session'}
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
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      {...register('date', { required: 'La date est requise' })}
                      className="input mt-1"
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                        Heure de début
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        {...register('startTime', { required: "L'heure de début est requise" })}
                        className="input mt-1"
                      />
                      {errors.startTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                        Heure de fin
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        {...register('endTime', { required: "L'heure de fin est requise" })}
                        className="input mt-1"
                      />
                      {errors.endTime && (
                        <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
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