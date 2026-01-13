# shared/urls.py
from django.urls import path
from . import views

# SOLO las vistas que SÍ existen en shared/views.py
urlpatterns = [
    path('health/', views.TestHealthView.as_view(), name='health'),
    path('public/', views.TestPublicView.as_view(), name='public'),
    path('protected/', views.TestProtectedView.as_view(), name='protected'),
    
    # COMENTA o ELIMINA estas líneas (no existen):
    # path('user/<int:id>/', views.UserDetailView.as_view()),
    # path('profile/', views.ProfileView.as_view()),
]