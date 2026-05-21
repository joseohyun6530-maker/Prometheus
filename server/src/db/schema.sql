-- COZY coffee order app schema (PostgreSQL)

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('RECEIVED', 'IN_PREPARATION', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS options (
  id VARCHAR(64) NOT NULL,
  menu_id VARCHAR(64) NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, menu_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  ordered_at TIMESTAMPTZ NOT NULL,
  status order_status NOT NULL DEFAULT 'RECEIVED',
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id VARCHAR(64) NOT NULL,
  menu_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  line_total INTEGER NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_item_options (
  id VARCHAR(64) PRIMARY KEY,
  order_item_id VARCHAR(64) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id VARCHAR(64) NOT NULL,
  option_name VARCHAR(255) NOT NULL,
  option_price INTEGER NOT NULL DEFAULT 0 CHECK (option_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_ordered_at ON orders (ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options (menu_id);
