# backend/dispatches/models.py
from django.db import models
import uuid

class Dispatch(models.Model):
    """Envios/Despachos del sistema"""
    
    SHIPMENT_TYPES = [
        ('standard', 'Estándar'),
        ('refrigerated', 'Refrigerado'),
        ('express', 'Express'),
        ('fragile', 'Frágil'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('preparing', 'Preparando'),
        ('dispatched', 'Despachado'),
        ('in_transit', 'En Tránsito'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
        ('returned', 'Devuelto'),
    ]
    
    PRIORITY_CHOICES = [
        (1, 'Baja'),
        (2, 'Media'),
        (3, 'Alta'),
        (4, 'Urgente'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dispatch_code = models.CharField(max_length=100, unique=True, verbose_name="Código de Despacho")
    
    # Relaciones - TEMPORAL: usando CharField hasta que inventory exista
    branch_id = models.CharField(max_length=100, verbose_name="ID de Sucursal")
    destination_zone_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="ID de Zona Destino")
    
    # Información del despacho
    shipment_type = models.CharField(
        max_length=20, 
        choices=SHIPMENT_TYPES, 
        default='standard',
        verbose_name="Tipo de Envío"
    )
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name="Estado"
    )
    
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES, 
        default=2,
        verbose_name="Prioridad"
    )
    
    # Productos en el despacho (JSON para flexibilidad)
    products = models.JSONField(
        verbose_name="Productos Despachados",
        help_text="Lista de productos en formato JSON: [{'product_id': 'uuid', 'quantity': 10, 'product_name': '...'}]",
        default=list  # Valor por defecto: lista vacía
    )
    
    # Requerimientos especiales
    requires_refrigeration = models.BooleanField(
        default=False,
        verbose_name="Requiere Refrigeración"
    )
    
    temperature_range = models.CharField(
        max_length=50, 
        null=True, 
        blank=True,
        verbose_name="Rango de Temperatura",
        help_text="Ej: '2°C - 6°C'"
    )
    
    special_instructions = models.TextField(
        null=True, 
        blank=True,
        verbose_name="Instrucciones Especiales"
    )
    
    # Fechas
    scheduled_date = models.DateField(
        verbose_name="Fecha Programada"
    )
    
    dispatched_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Fecha de Despacho"
    )
    
    delivered_at = models.DateTimeField(
        null=True, 
 blank=True,
        verbose_name="Fecha de Entrega"
    )
    
    # Auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Creado Por (Usuario ID)"
    )
    
    class Meta:
        verbose_name = "Despacho"
        verbose_name_plural = "Despachos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['dispatch_code']),
            models.Index(fields=['status']),
            models.Index(fields=['scheduled_date']),
            models.Index(fields=['branch_id', 'status']),
        ]
    
    def __str__(self):
        return f"{self.dispatch_code} - {self.get_status_display()}"
    
    @property
    def is_active(self):
        """Verifica si el despacho está activo (no cancelado ni entregado)"""
        return self.status not in ['delivered', 'cancelled', 'returned']
    
    @property
    def total_products(self):
        """Calcula el total de productos en el despacho"""
        if isinstance(self.products, list):
            return len(self.products)
        return 0
    
    @property
    def total_quantity(self):
        """Calcula la cantidad total de items en el despacho"""
        total = 0
        if isinstance(self.products, list):
            for product in self.products:
                total += product.get('quantity', 0)
        return total
    
    def mark_as_dispatched(self):
        """Marca el despacho como enviado"""
        from django.utils import timezone
        self.status = 'dispatched'
        self.dispatched_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        """Marca el despacho como entregado"""
        from django.utils import timezone
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()


class DispatchHistory(models.Model):
    """Historial de cambios en los despachos"""
    
    ACTION_CHOICES = [
        ('created', 'Creado'),
        ('updated', 'Actualizado'),
        ('status_changed', 'Estado Cambiado'),
        ('dispatched', 'Despachado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
        ('note_added', 'Nota Agregada'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relación con Dispatch
    dispatch_id = models.CharField(max_length=100, verbose_name="ID de Despacho")
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        verbose_name="Acción"
    )
    
    description = models.TextField(
        verbose_name="Descripción"
    )
    
    changes = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Cambios Realizados",
        help_text="Detalle de los cambios en formato JSON",
        default=dict
    )
    
    # Usuario que realizó la acción
    performed_by = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Realizado Por (Usuario ID)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Historial de Despacho"
        verbose_name_plural = "Historiales de Despachos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['dispatch_id', 'created_at']),
            models.Index(fields=['action']),
        ]
    
    def __str__(self):
        return f"Historial - {self.dispatch_id} - {self.get_action_display()}"


class DispatchNote(models.Model):
    """Notas adicionales para los despachos"""
    
    NOTE_TYPES = [
        ('internal', 'Interna'),
        ('customer', 'Cliente'),
        ('driver', 'Conductor'),
        ('warehouse', 'Almacén'),
        ('other', 'Otro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relación con Dispatch
    dispatch_id = models.CharField(max_length=100, verbose_name="ID de Despacho")
    
    note_type = models.CharField(
        max_length=20,
        choices=NOTE_TYPES,
        default='internal',
        verbose_name="Tipo de Nota"
    )
    
    content = models.TextField(
        verbose_name="Contenido"
    )
    
    is_important = models.BooleanField(
        default=False,
        verbose_name="Importante"
    )
    
    created_by = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Creado Por (Usuario ID)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Nota de Despacho"
        verbose_name_plural = "Notas de Despachos"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['dispatch_id', 'note_type']),
            models.Index(fields=['is_important']),
        ]
    
    def __str__(self):
        return f"Nota para {self.dispatch_id}"


# Modelo simplificado para destinos
class Destination(models.Model):
    """Destinos frecuentes para despachos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nombre del Destino")
    address = models.TextField(verbose_name="Dirección")
    contact_person = models.CharField(max_length=255, null=True, blank=True, verbose_name="Persona de Contacto")
    contact_phone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Teléfono de Contacto")
    contact_email = models.EmailField(null=True, blank=True, verbose_name="Email de Contacto")
    
    # Zona especial si aplica (ID como texto por ahora)
    special_zone_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="ID de Zona Especial"
    )
    
    # Información adicional
    requires_refrigeration_access = models.BooleanField(
        default=False,
        verbose_name="Requiere Acceso a Refrigeración"
    )
    
    delivery_hours = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Horario de Entrega",
        help_text="Ej: 'Lunes a Viernes 8:00-18:00'"
    )
    
    notes = models.TextField(null=True, blank=True, verbose_name="Notas Adicionales")
    
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Destino"
        verbose_name_plural = "Destinos"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name