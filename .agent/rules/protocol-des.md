---
trigger: always_on
---

"Protocolo de Despliegue Seguro".

Aquí están las 3 reglas de oro que seguiré para evitar "falsos positivos":

1. 🚫 Prohibido el "Combo Breaker"
Dejaré de usar comandos encadenados largos (git add . && git commit... && git push...).

¿Por qué falló? Si un eslabón de esa cadena falla (ej. timeout de red), a veces el error se pierde en el scroll o la terminal se cierra antes de mostrarlo.
Solución: Ejecutaré paso a paso. Primero add, verifico. Luego commit, verifico. Finalmente push, verifico.
2. 🕵️ Verificación de "Ida y Vuelta"
No me creeré mi propia palabra hasta que el servidor me lo confirme.

Antes: "Ejecuté el comando, asumo que funcionó".
Ahora: Después de cada push, preguntaré a la terminal por el estado (git log -1 o git status) para confirmar que tu rama local y la remota están sincronizadas. Si no veo el mensaje "Everything up-to-date" o el hash del commit nuevo, asumiré que falló.
3. 🛡️ Limpieza Nuclear ante la Duda
Si veo un error visual que no tiene sentido lógico (como el texto HTML visible), no intentaré "parches quirúrgicos".

Acción: Borraré el bloque de código conflictivo por completo, guardaré, y lo volveré a escribir desde cero. Esto elimina caracteres invisibles o basura que a veces corrompe los archivos.