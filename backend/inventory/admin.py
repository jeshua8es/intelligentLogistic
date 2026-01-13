# backend/inventory/admin.py
from django.contrib import admin

# Importar SOLO si los modelos existen
try:
    from .models import (
        Product, Region, Branch, SpecialZone,
        GeneralInventory, RegionalInventory, InventoryTransaction
    )
    
    # Registrar con decoradores (una sola vez por modelo)
    @admin.register(Product)
    class ProductAdmin(admin.ModelAdmin):
        list_display = ['product_code', 'product_name', 'category', 'requires_refrigeration']
        search_fields = ['product_code', 'product_name']
        list_filter = ['category', 'requires_refrigeration']
    
    @admin.register(Region)
    class RegionAdmin(admin.ModelAdmin):
        list_display = ['name', 'climate_type']
        search_fields = ['name']
    
    @admin.register(Branch)
    class BranchAdmin(admin.ModelAdmin):
        list_display = ['branch_code', 'name', 'region', 'is_active']
        list_filter = ['region', 'is_active']
        search_fields = ['branch_code', 'name']
    
    @admin.register(SpecialZone)
    class SpecialZoneAdmin(admin.ModelAdmin):
        list_display = ['zone_code', 'zone_name', 'region_name', 'has_refrigeration_priority']
        list_filter = ['has_refrigeration_priority']
    
    @admin.register(GeneralInventory)
    class GeneralInventoryAdmin(admin.ModelAdmin):
        list_display = ['product', 'quantity', 'min_stock', 'max_stock', 'last_updated']
        search_fields = ['product__product_code', 'product__product_name']
        list_filter = ['last_updated']
    
    @admin.register(RegionalInventory)
    class RegionalInventoryAdmin(admin.ModelAdmin):
        list_display = ['product', 'branch', 'region', 'quantity', 'last_updated']
        list_filter = ['region', 'branch']
        search_fields = ['product__product_name', 'branch__name']
    
    @admin.register(InventoryTransaction)
    class InventoryTransactionAdmin(admin.ModelAdmin):
        list_display = ['transaction_type', 'product', 'quantity', 'created_at']
        list_filter = ['transaction_type', 'created_at']
        search_fields = ['product__product_name']
        
except ImportError as e:
    print(f"Error importando modelos: {e}")
    # Si los modelos no existen, no hagas nada
    pass