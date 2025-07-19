"use client"
import React from "react"

interface ModalProps {
    title: string
    message: string
    onClose: () => void
}

export function Modal({ title, message, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background dark:bg-zinc-900 p-6 rounded-md shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border bg-muted text-foreground"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
