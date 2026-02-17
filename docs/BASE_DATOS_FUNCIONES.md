# Base de Datos y Funciones RPC - Intelligent Logistic

## 📊 Tablas Principales

### products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    requires_refrigeration BOOLEAN DEFAULT false,
    min_temperature NUMERIC(5,2),
    max_temperature NUMERIC(5,2),
    special_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
## TABLAS
## General inventory
CREATE TABLE general_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    location TEXT,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_product_branch UNIQUE(product_id, branch_id)
);

## branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    region_id UUID REFERENCES regions(id),
    address TEXT,
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    climate_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- inventory_transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    product_id UUID REFERENCES products(id),
    from_location_type VARCHAR(50),
    to_location_type VARCHAR(50),
    quantity INTEGER NOT NULL,
    notes TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- inventory_history
CREATE TABLE inventory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    product_id UUID REFERENCES products(id),
    change_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_code VARCHAR(50) UNIQUE NOT NULL,
    branch_id UUID REFERENCES branches(id),
    destination_zone_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    products JSONB,
    requires_refrigeration BOOLEAN DEFAULT false,
    temperature_range VARCHAR(50),
    special_instructions TEXT,
    scheduled_date DATE,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Versión completa de la función (la que está funcionando)
CREATE OR REPLACE FUNCTION update_general_inventory(
    p_product_id UUID,
    p_branch_id UUID,
    p_new_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
BEGIN
    INSERT INTO general_inventory (
        product_id,
        branch_id,
        quantity,
        last_updated
    ) VALUES (
        p_product_id,
        p_branch_id,
        p_new_quantity,
        NOW()
    )
    ON CONFLICT (product_id, branch_id) 
    DO UPDATE SET 
        quantity = p_new_quantity,
        last_updated = NOW();
    
    v_result := json_build_object(
        'success', true,
        'message', '✅ Inventario actualizado',
        'data', json_build_object(
            'product_id', p_product_id,
            'branch_id', p_branch_id,
            'new_quantity', p_new_quantity
        )
    );
    
    RETURN v_result;
END;
$$;

-- PERMISOS (MUY IMPORTANTE)
GRANT EXECUTE ON FUNCTION update_general_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION update_general_inventory TO anon;
GRANT EXECUTE ON FUNCTION update_general_inventory TO service_role;

-- Las 5 migraciones en orden
-- 1. Agregar columna
ALTER TABLE general_inventory ADD COLUMN branch_id UUID REFERENCES branches(id);

-- 2. Actualizar registros existentes
UPDATE general_inventory SET branch_id = '0faa341d-6729-4ced-92e7-fa76d70e6e3d' WHERE branch_id IS NULL;

-- 3. Eliminar constraint antigua
ALTER TABLE general_inventory DROP CONSTRAINT IF EXISTS general_inventory_product_id_key;

-- 4. Crear constraint compuesta
ALTER TABLE general_inventory ADD CONSTRAINT general_inventory_product_branch_unique UNIQUE (product_id, branch_id);

-- 5. Hacer NOT NULL
ALTER TABLE general_inventory ALTER COLUMN branch_id SET NOT NULL;






