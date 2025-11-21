export const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Acepta solo letras y espacios
export const NAME_REGEX_EXTENDED = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,;:()'"-]*$/; // Acepta letras, espacios y algunos caracteres especiales
export const PRICE_REGEX = /^\d+(\.\d{1,2})?$/; // Acepta Solo numeros positvos o decimales
export const DESC_REGEX = /^[\w\sáéíóúÁÉÍÓÚñÑ.,;:()'"-]*$/; // Acepta letras, numeros y algunos caracteres especiales
export const IMAGE_FILE_REGEX = /\.(jpg|jpeg|png)$/i; // Acepta solo archivos con extensiones .jpg, .jpeg, .png
export const PHONE_REGEX = /^[0-9]{10}$/; // Acepta solo números de 10 dígitos
export const PASSWORD_STRONG_REGEX = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[\W_]).{6,10}$/; // Mínimo 6 caracteres, al menos una mayúscula, una minúscula, un número y un caracter especial