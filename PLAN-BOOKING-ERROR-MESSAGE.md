# Plan: Mostrar mensaje de error del servidor al agendar clase (400)

## Situación actual

**Endpoint:** `POST /meetings/book`  
**Componente:** `MeetingBookingComponent` (student booking)

### Comportamiento actual (líneas 423-436)

```typescript
error: (err) => {
  const backendMsg = err?.error?.message;

  if (backendMsg?.includes("No se puede programar una clase")) {
    this.showModalMessage(backendMsg);
    // ...
  } else {
    // Mensaje GENÉRICO hardcodeado
    this.showModalMessage("Ya tienes una meeting agendada en la fecha y hora seleccionada.");
    // ...
  }
}
```

- Solo se muestra el mensaje del servidor si incluye "No se puede programar una clase".
- En cualquier otro caso 400 se muestra un mensaje genérico.
- El servidor puede devolver mensajes distintos (overlap, evaluaciones pendientes, horario no disponible, etc.) que no se muestran al usuario.

## Objetivo

Mostrar siempre el mensaje de error que devuelve el servidor cuando responde 400 al endpoint `/meetings/book`, en lugar de sustituirlo por mensajes genéricos.

---

## Plan de implementación

### 1. Extraer mensaje de error de forma robusta

El backend puede devolver el mensaje en distintos formatos:

| Formato | Ejemplo |
|---------|---------|
| `{ message: string }` | `{ message: "No se puede programar..." }` |
| `{ message: string[] }` (validación NestJS) | `{ message: ["Campo inválido"] }` |
| `message` como string directo | Algunos frameworks devuelven `error` como string |

Implementar un helper que:
1. Extraiga `err?.error?.message`
2. Si es un array, unir con `\n` o mostrar el primero
3. Si no hay mensaje, usar un fallback: `"No se pudo agendar la clase. Intenta nuevamente."`

### 2. Cambiar la lógica de error en `bookMeeting()`

- Eliminar la condición `if (backendMsg?.includes("No se puede programar una clase"))`.
- Usar siempre el mensaje extraído del servidor (o el fallback).
- Mantener `showModalMessage` y `hideModalAfterDelay` con tiempos razonables para mensajes largos (ej. 5s).

### 3. Considerar otros formatos de respuesta

- `err?.error?.error` (algunos backends).
- `err?.message` como fallback final.
- Manejo de `err?.error` siendo un string (Axios a veces devuelve así).

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/app/pages/dashboard/meeting-booking/meeting-booking.component.ts` | Simplificar el bloque `error` de `bookMeeting()` para usar siempre el mensaje del servidor. Opcional: helper para extraer el mensaje. |

---

## Código propuesto

```typescript
// Helper para extraer mensaje de error (opcional, puede ir inline)
private getErrorMessage(err: any): string {
  const msg = err?.error?.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg) && msg.length > 0) return msg[0];
  if (err?.error?.error) return String(err.error.error);
  if (err?.message) return String(err.message);
  return 'No se pudo agendar la clase. Intenta nuevamente.';
}

// En bookMeeting() error handler:
error: (err) => {
  const message = this.getErrorMessage(err);
  this.showModalMessage(message);
  this.showSuccessModal = false;
  this.hideModalAfterDelay(message.length > 80 ? 6000 : 5000);
}
```

---

## Referencia

- `SearchingMeetingInstructorComponent` (líneas 375-379) ya hace:  
  `error?.error?.message || 'No se pudo crear la clase'`
- Este cambio alinea el comportamiento del estudiante con el del instructor.
