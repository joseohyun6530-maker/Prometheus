/** @typedef {{ id: string; name: string; price: number }} ApiOption */
/** @typedef {{ id: string; name: string; description: string; price: number; image_url: string | null; stock_quantity: number; available: boolean; options: ApiOption[] }} ApiMenu */
/** @typedef {{ menu_id: string; name: string; stock_quantity: number; stock_status: string }} ApiInventoryItem */
/** @typedef {{ total: number; received: number; in_preparation: number; completed: number }} ApiDashboard */
