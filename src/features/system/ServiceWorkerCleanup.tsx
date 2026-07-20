"use client";

import { useEffect } from "react";

/**
 * O protótipo anterior deste app registrava um service worker.
 * Dispositivos que o visitaram antes podem ainda tê-lo ativo, servindo
 * conteúdo antigo em cache indefinidamente. Este componente desregistra
 * qualquer service worker e limpa caches assim que a página carrega,
 * sem depender do ciclo de atualização do próprio navegador.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });

    if ("caches" in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  }, []);

  return null;
}
