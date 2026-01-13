# inventory/models.py
"""
Modelos de Django para el módulo de inventario.

Un modelo en Django:
1. Representa una tabla en la base de datos
2. Cada atributo es una columna
3. Django crea automáticamente el SQL

Vamos a crear ProductoLocal para practicar con SQLite local.
"""

from django.db import models

class ProductoLocal(models.Model):
    """
    Modelo para productos almacenados localmente en SQLite.
    
    Campos (columnas de la tabla):
    - id: Se crea automáticamente (Integer, Primary Key, Auto-increment)
    - nombre: Texto corto (CharField → VARCHAR en SQL)
    - descripcion: Texto largo (TextField → TEXT en SQL)
    - cantidad: Número entero (IntegerField → INTEGER en SQL)
    - precio: Número decimal (DecimalField → DECIMAL en SQL)
    - fecha_creacion: Fecha/hora automática (DateTimeField → DATETIME en SQL)
    - activo: Verdadero/Falso (BooleanField → BOOLEAN en SQL)
    """
    
    # CharField = Campo de texto con longitud máxima
    nombre = models.CharField(
        max_length=100,  # Máximo 100 caracteres
        verbose_name="Nombre del producto",
        help_text="Nombre descriptivo del producto"
    )
    
    # TextField = Campo de texto largo (sin límite de longitud)
    descripcion = models.TextField(
        verbose_name="Descripción",
        help_text="Descripción detallada del producto",
        blank=True,   # Puede estar vacío en formularios
        null=True     # Puede ser NULL en la base de datos
    )
    
    # IntegerField = Número entero
    cantidad = models.IntegerField(
        verbose_name="Cantidad en stock",
        default=0,    # Valor por defecto si no se especifica
        help_text="Cantidad disponible en inventario"
    )
    
    # DecimalField = Número decimal con precisión específica
    precio = models.DecimalField(
        max_digits=10,     # Máximo 10 dígitos totales
        decimal_places=2,  # 2 decimales
        verbose_name="Precio unitario",
        help_text="Precio en COP (Pesos Colombianos)"
    )
    
    # DateTimeField = Fecha y hora
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,  # Se establece automáticamente al crear
        verbose_name="Fecha de creación"
    )
    
    # BooleanField = Verdadero/Falso
    activo = models.BooleanField(
        default=True,  # Por defecto activo
        verbose_name="¿Activo?",
        help_text="Indica si el producto está activo en el sistema"
    )
    
    class Meta:
        """
        Configuraciones adicionales del modelo.
        Meta = Metadatos (datos sobre los datos)
        """
        verbose_name = "Producto Local"           # Nombre singular en admin
        verbose_name_plural = "Productos Locales" # Nombre plural en admin
        ordering = ['-fecha_creacion']  # Ordenar por fecha descendente
        # -fecha_creacion = Más recientes primero
    
    def __str__(self):
        """
        Representación en texto del modelo.
        Se muestra en: admin, shell, logs, etc.
        """
        return f"{self.nombre} ({self.cantidad} unidades)"
    
    # ============================================
    # MÉTODOS PERSONALIZADOS (no son campos en BD)
    # ============================================
    
    def valor_total(self):
        """
        Calcula el valor total del stock.
        No se almacena en BD, se calcula cuando se necesita.
        """
        try:
            return self.cantidad * self.precio
        except:
            return 0
    
    def tiene_stock(self):
        """Verifica si hay stock disponible."""
        return self.cantidad > 0
    
    def esta_activo(self):
        """Verifica si el producto está activo."""
        return self.activo
    
    def puede_venderse(self):
        """Verifica si el producto puede venderse."""
        return self.activo and self.cantidad > 0 and self.precio > 0