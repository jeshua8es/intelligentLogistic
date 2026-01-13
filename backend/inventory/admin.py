# inventory/admin.py
from django.contrib import admin
from .models import ProductoLocal

@admin.register(ProductoLocal)  # Decorador que registra el modelo
class ProductoLocalAdmin(admin.ModelAdmin):
    """
    Configuración para mostrar ProductoLocal en el admin de Django.
    """
    
    # Campos a mostrar en la lista
    list_display = ['nombre', 'cantidad', 'precio', 'valor_total', 'activo', 'fecha_creacion']
    
    # Campos por los que se puede filtrar
    list_filter = ['activo', 'fecha_creacion']
    
    # Campos por los que se puede buscar
    search_fields = ['nombre', 'descripcion']
    
    # Campos editables directamente en la lista
    list_editable = ['cantidad', 'precio', 'activo']
    
    # Paginación
    list_per_page = 20
    
    # Orden por defecto
    ordering = ['-fecha_creacion']