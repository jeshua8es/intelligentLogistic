# backend/urls.py
from django.contrib import admin
from django.urls import path
from inventory.views import (
    HelloWorldAPIView, 
    SimpleHelloAPIView, 
    assign_to_branch_api, 
    inventory_summary_api,
    AssignToBranchAPIView,
    CreateGeneralInventoryAPIView,
    InventorySummaryAPIView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs antiguas (para compatibilidad)
    path('api/inventory/hello/', HelloWorldAPIView.as_view(), name='inventory-hello'),
    path('api/inventory/simple/', SimpleHelloAPIView.as_view(), name='simple-hello'),
    path('api/inventory/assign/', assign_to_branch_api, name='assign-to-branch'),
    path('api/inventory/summary/', inventory_summary_api, name='inventory-summary'),
    
    # Nuevas URLs (API REST estilo)
    path('api/v1/inventory/assign/', AssignToBranchAPIView.as_view(), name='api-v1-assign'),
    path('api/v1/inventory/create/', CreateGeneralInventoryAPIView.as_view(), name='api-v1-create'),
    path('api/v1/inventory/summary/', InventorySummaryAPIView.as_view(), name='api-v1-summary'),
]