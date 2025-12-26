# API de Adjuntos de Cotizaciones

## Endpoints Disponibles

### 1. Subir Archivos Adjuntos
**POST** `/api/quote-attachment/`

Sube múltiples archivos adjuntos a una cotización.

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (FormData):**
- `quote_id`: ID de la cotización (number)
- `files`: Array de archivos (hasta 10 archivos)

**Ejemplo de uso con JavaScript/FormData:**
```javascript
const formData = new FormData();
formData.append('quote_id', '1');
formData.append('files', file1);
formData.append('files', file2);
// ... más archivos

fetch('http://localhost:4000/api/quote-attachment/', {
  method: 'POST',
  body: formData
})
```

**Respuesta exitosa (201):**
```json
{
  "message": "2 archivo(s) adjunto(s) agregado(s) correctamente",
  "attachments": [
    {
      "id": 1,
      "quote_id": 1,
      "file_url": "/attachment/documento-1735047234567-123456789.pdf",
      "file_name": "documento.pdf",
      "createdAt": "2024-12-24T12:00:00.000Z",
      "updatedAt": "2024-12-24T12:00:00.000Z"
    }
  ]
}
```

---

### 2. Listar Adjuntos de una Cotización
**GET** `/api/quote-attachment/:quote_id`

Obtiene todos los archivos adjuntos de una cotización específica.

**Parámetros:**
- `quote_id`: ID de la cotización

**Ejemplo:**
```
GET /api/quote-attachment/1
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "quote_id": 1,
    "file_url": "/attachment/documento-1735047234567-123456789.pdf",
    "file_name": "documento.pdf",
    "createdAt": "2024-12-24T12:00:00.000Z",
    "updatedAt": "2024-12-24T12:00:00.000Z"
  },
  {
    "id": 2,
    "quote_id": 1,
    "file_url": "/attachment/imagen-1735047234567-987654321.jpg",
    "file_name": "imagen.jpg",
    "createdAt": "2024-12-24T12:01:00.000Z",
    "updatedAt": "2024-12-24T12:01:00.000Z"
  }
]
```

---

### 3. Eliminar un Adjunto
**DELETE** `/api/quote-attachment/:id`

Elimina un archivo adjunto específico.

**Parámetros:**
- `id`: ID del adjunto a eliminar

**Ejemplo:**
```
DELETE /api/quote-attachment/1
```

**Respuesta exitosa (200):**
```json
{
  "message": "Archivo adjunto eliminado correctamente"
}
```

---

## Acceso a Archivos

Los archivos subidos se pueden acceder directamente mediante la URL:

```
http://localhost:4000/attachment/nombre-del-archivo.ext
```

Por ejemplo, si `file_url` es `/attachment/documento-1735047234567-123456789.pdf`, se puede acceder en:

```
http://localhost:4000/attachment/documento-1735047234567-123456789.pdf
```

---

## Configuración de Multer

- **Tipos de archivo permitidos:** jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx, txt
- **Tamaño máximo por archivo:** 10MB
- **Cantidad máxima de archivos:** 10 por request
- **Carpeta de almacenamiento:** `src/public/attachment`

---

## Características Importantes

### Transacciones
El endpoint de subida usa transacciones de Sequelize para garantizar consistencia:
- Si falla el guardado en BD, los archivos subidos se eliminan automáticamente
- Si algún archivo falla, toda la operación se revierte

### Validaciones
- Verifica que la cotización exista antes de subir archivos
- Valida tipos de archivo y tamaño
- Elimina archivos huérfanos en caso de error

### Nombres de Archivo
Los archivos se renombran automáticamente con un timestamp único para evitar colisiones:
```
nombre-original-1735047234567-123456789.ext
```