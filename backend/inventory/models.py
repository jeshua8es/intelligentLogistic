# backend/inventory/models.py
from django.db import models
import uuid

# Si necesitas referenciar modelos de otras apps
from django.conf import settings

# =================== MODELOS BASE (si no existen) ===================

class Product(models.Model):
    """Productos del sistema"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_code = models.CharField(max_length=100, unique=True)
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    requires_refrigeration = models.BooleanField(default=False)
    min_temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    special_conditions = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product_code} - {self.product_name}"

class Region(models.Model):
    """Regiones geográficas"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    climate_type = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Branch(models.Model):
    """Sucursales"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='branches')
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.branch_code} - {self.name}"

class SpecialZone(models.Model):
    """Zonas especiales con condiciones específicas (ej: refrigeración)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    zone_code = models.CharField(max_length=50, unique=True)
    zone_name = models.CharField(max_length=255)
    region_name = models.CharField(max_length=100)  # Para match con special_zones de Supabase
    has_refrigeration_priority = models.BooleanField(default=False)
    additional_requirements = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.zone_code} - {self.zone_name}"

# =================== MODELOS NUEVOS (CRUD Inventario) ===================

class GeneralInventory(models.Model):
    """
    Inventario general - Tabla equivalente a general_inventory en Supabase
    """
    product = models.OneToOneField(
        Product, 
        on_delete=models.CASCADE, 
        primary_key=True,
        related_name='general_inventory'
    )
    quantity = models.IntegerField(default=0)
    min_stock = models.IntegerField(null=True, blank=True)
    max_stock = models.IntegerField(null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Inventario General"
        verbose_name_plural = "Inventarios Generales"
        db_table = 'general_inventory'  # Para que coincida con Supabase
    
    def __str__(self):
        return f"{self.product}: {self.quantity} unidades"
    
    @property
    def status(self):
        """Estado del inventario basado en niveles"""
        if self.min_stock and self.quantity <= self.min_stock:
            return "low"
        elif self.max_stock and self.quantity >= self.max_stock:
            return "high"
        return "normal"

class RegionalInventory(models.Model):
    """
    Inventario por sucursal - Tabla equivalente a regional_inventory en Supabase
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE,
        related_name='regional_inventories'
    )
    region = models.ForeignKey(
        Region, 
        on_delete=models.CASCADE,
        related_name='regional_inventories'
    )
    branch = models.ForeignKey(
        Branch, 
        on_delete=models.CASCADE,
        related_name='regional_inventories'
    )
    product_sku = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=0)
    min_temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    special_conditions = models.TextField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Inventario Regional"
        verbose_name_plural = "Inventarios Regionales"
        db_table = 'regional_inventory'  # Para que coincida con Supabase
        unique_together = ['product', 'branch']  # IMPORTANTE: Igual que en Supabase
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'branch'], 
                name='unique_product_branch'
            )
        ]
    
    def __str__(self):
        return f"{self.product} en {self.branch}: {self.quantity} unidades"

class InventoryTransaction(models.Model):
    """
    Auditoría de transacciones - Tabla equivalente a inventory_transactions en Supabase
    """
    TRANSACTION_TYPES = [
        ('initial', 'Stock Inicial'),
        ('transfer', 'Transferencia'),
        ('adjustment', 'Ajuste'),
        ('sale', 'Venta'),
        ('return', 'Devolución'),
        ('waste', 'Pérdida'),
    ]
    
    LOCATION_TYPES = [
        ('general', 'Inventario General'),
        ('regional', 'Inventario Regional'),
        ('branch', 'Sucursal'),
        ('external', 'Externo'),
        ('supplier', 'Proveedor'),
        ('customer', 'Cliente'),
        ('waste', 'Pérdida'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='transactions')
    from_location_type = models.CharField(max_length=20, choices=LOCATION_TYPES, null=True, blank=True)
    from_location_id = models.UUIDField(null=True, blank=True)
    to_location_type = models.CharField(max_length=20, choices=LOCATION_TYPES)
    to_location_id = models.UUIDField(null=True, blank=True)
    quantity = models.IntegerField()
    notes = models.TextField(null=True, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Transacción de Inventario"
        verbose_name_plural = "Transacciones de Inventario"
        db_table = 'inventory_transactions'  # Para que coincida con Supabase
        indexes = [
            models.Index(fields=['product', 'created_at']),
            models.Index(fields=['created_at']),
            models.Index(fields=['transaction_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.product}: {self.quantity}"