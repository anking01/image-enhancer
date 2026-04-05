import { useContext } from 'react'
import { ToastContext } from '../components/ToastProvider.jsx'

export function useToast() {
  return useContext(ToastContext)
}
