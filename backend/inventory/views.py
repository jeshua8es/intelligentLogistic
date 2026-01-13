# backend/inventory/views.py
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

# ==================== VIEWS BÁSICAS ====================

class HelloWorldAPIView(View):
    """Vista básica de prueba"""
    def get(self, request):
        return JsonResponse({
            'message': 'Hello from Inventory API!',
            'status': 'active'
        })

class SimpleHelloAPIView(View):
    """Otra vista básica de prueba"""
    def get(self, request):
        return JsonResponse({
            'message': 'Simple Hello from Inventory System!',
            'version': '1.0'
        })

# ==================== CRUD API VIEWS ====================

@method_decorator(csrf_exempt, name='dispatch')
class AssignToBranchAPIView(View):
    """API para asignar productos a sucursales"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            # Simulación - luego integraremos con PostgreSQL
            return JsonResponse({
                'success': True,
                'message': f"Producto asignado exitosamente a sucursal",
                'data': {
                    'product_id': data.get('product_id', ''),
                    'branch_id': data.get('branch_id', ''),
                    'quantity': data.get('quantity', 0),
                    'timestamp': '2024-01-01T00:00:00Z'  # Temporal
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@method_decorator(csrf_exempt, name='dispatch')  
@csrf_exempt
def create_general_inventory_api(request):
    """Crea inventario general usando función PostgreSQL"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            with connection.cursor() as cursor:
                cursor.callproc('create_general_inventory', [
                    data['product_id'],
                    data['quantity'],
                    data.get('min_stock'),
                    data.get('max_stock'),
                    data.get('location'),
                    data.get('notes', '')
                ])
                result = cursor.fetchone()
            return JsonResponse(result[0] if result else {'success': False})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
class CreateGeneralInventoryAPIView(View):
    """API para crear/actualizar inventario general"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            return JsonResponse({
                'success': True,
                'message': 'Inventario general actualizado',
                'data': data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

class InventorySummaryAPIView(View):
    """API para resumen del inventario"""
    
    def get(self, request):
        return JsonResponse({
            'success': True,
            'data': {
                'total_products': 0,
                'total_branches': 0,
                'total_stock': 0,
                'message': 'Sistema de inventario activo'
            }
        })

# ==================== FUNCTIONS (para urls.py antiguo) ====================

@csrf_exempt
def assign_to_branch_api(request):
    """Función para compatibilidad con urls.py existente"""
    if request.method == 'POST':
        view = AssignToBranchAPIView()
        return view.post(request)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def inventory_summary_api(request):
    """Función para compatibilidad con urls.py existente"""
    view = InventorySummaryAPIView()
    return view.get(request)