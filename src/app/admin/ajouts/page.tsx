'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AppBar } from '@/components/layout/AppBar'
import { useEtudiants } from '@/hooks/useEtudiants'
import { EtudiantInput } from '@/hooks/useEtudiants'

export default function AjoutsPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { createEtudiant } = useEtudiants()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EtudiantInput>()

  const onSubmit = async (data: EtudiantInput) => {
    try {
      setIsSuccess(false)
      setIsError(false)
      await createEtudiant(data)
      setIsSuccess(true)
      reset()
    } catch (error) {
      setIsError(true)
      setErrorMessage('Une erreur est survenue lors de l\'ajout de l\'autorisation.')
      console.error('Error adding authorization:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Gestion des autorisations
          </h1>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ajouter une autorisation
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Ajouter l\'autorisation'}
                </button>
              </div>
            </form>

            {isSuccess && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                L'autorisation a été ajoutée avec succès.
              </div>
            )}

            {isError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 