"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ShoppingCart,
  CreditCard,
  Settings,
  Plus,
  Minus,
  X,
  Edit2,
  Check,
  DollarSign,
  Upload,
  Trash2,
  RotateCcw,
  Lock,
  Download,
} from "lucide-react"

interface Item {
  id: number
  name: string
  price: number
  photo: string
  number: string
  deleted?: boolean
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  photo: string
  number: string
  isCustom?: boolean
  description?: string
}

interface Order {
  id: number
  items: CartItem[]
  total: number
  timestamp: Date
  originalTotal?: number
  createdBy: string
}

function LoginForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.username)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold">Eva拉丁美食 - Terminal de Ventas</h1>
          <p className="text-muted-foreground">Por favor inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Usuario"
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

const addCustomItem = (cart: any, setCart: any, customItem: any, setCustomItem: any, setShowCustomForm: any) => {
  const newItem: CartItem = {
    id: Date.now(),
    name: "Custom Item",
    price: Number.parseFloat(customItem.price),
    quantity: 1,
    photo: "/placeholder.svg",
    number: "",
    isCustom: true,
    description: customItem.description,
  }
  setCart([...cart, newItem])
  setCustomItem({ description: "", price: "" })
  setShowCustomForm(false)
}

export default function SalesApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<"sales" | "payment" | "config">("sales")
  const [items, setItems] = useState<Item[]>([])
  const [nextItemId, setNextItemId] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customItem, setCustomItem] = useState({ description: "", price: "" })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [editingTotal, setEditingTotal] = useState("")
  const [paymentHistory, setPaymentHistory] = useState<Order[]>([])

  const [configView, setConfigView] = useState<"items" | "deleted">("items")
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [newItem, setNewItem] = useState({ name: "", price: "", photo: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [priceOverride, setPriceOverride] = useState<{ [orderId: number]: string }>({})

  const loadDataFromServer = async () => {
    console.log("[v0] Loading data from server...")
    try {
      const [itemsRes, ordersRes, completedRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/orders"),
        fetch("/api/completed-orders"),
      ])

      console.log("[v0] API responses:", {
        itemsStatus: itemsRes.status,
        ordersStatus: ordersRes.status,
        completedStatus: completedRes.status,
      })

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        console.log("[v0] Loaded items from server:", itemsData.items?.length || 0)
        setItems(itemsData.items || [])
        setNextItemId(itemsData.nextItemId || 1)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        console.log("[v0] Loaded orders from server:", ordersData.length || 0)
        setOrders(
          ordersData.map((order: any) => ({
            ...order,
            timestamp: new Date(order.timestamp),
          })),
        )
      }

      if (completedRes.ok) {
        const completedData = await completedRes.json()
        console.log("[v0] Loaded completed orders from server:", completedData.length || 0)
        setPaymentHistory(
          completedData.map((order: any) => ({
            ...order,
            timestamp: new Date(order.timestamp),
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Failed to load data from server:", error)
      setItems([
        { id: 1, name: "Coffee", price: 3.5, photo: "/coffee-cup.png", number: "001" },
        { id: 2, name: "Sandwich", price: 8.99, photo: "/classic-sandwich.png", number: "002" },
        { id: 3, name: "Salad", price: 12.5, photo: "/fresh-salad.png", number: "003" },
        { id: 4, name: "Juice", price: 4.25, photo: "/glass-of-orange-juice.png", number: "004" },
        { id: 5, name: "Pastry", price: 5.75, photo: "/assorted-pastries.png", number: "005" },
        { id: 6, name: "Tea", price: 2.99, photo: "/elegant-tea-cup.png", number: "006" },
      ])
      setNextItemId(7)
    }
  }

  const saveItemToServer = async (newItem: any) => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
      console.log("[v0] Save item response:", response.status)
    } catch (error) {
      console.error("[v0] Failed to save item to server:", error)
    }
  }

  const saveOrderToServer = async (order: Order) => {
    console.log("[v0] Saving order to server:", order.id)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      console.log("[v0] Save order response:", response.status)
    } catch (error) {
      console.error("[v0] Failed to save order to server:", error)
    }
  }

  const saveCompletedOrderToServer = async (order: Order) => {
    try {
      await fetch("/api/completed-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
    } catch (error) {
      console.error("Failed to save completed order to server:", error)
    }
  }

  const deleteOrderFromServer = async (orderId: number) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Failed to delete order from server:", error)
    }
  }

  useEffect(() => {
    console.log("[v0] Authentication status changed:", isAuthenticated)
    const verifySession = async () => {
      try {
        console.log("[v0] Starting session verification")
        const response = await fetch("/api/auth/verify")

        if (!response.ok) {
          console.log("[v0] Response not ok:", response.status, response.statusText)
          if (response.status === 500) {
            console.error("[v0] Server error during verification")
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()
        console.log("[v0] Session verification response:", data)

        if (data.authenticated) {
          setIsAuthenticated(true)
          setCurrentUser(data.username)
          console.log("[v0] User authenticated:", data.username)
        }
      } catch (error) {
        console.error("[v0] Session verification failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setIsAuthenticated(false)
      setCurrentUser("")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadDataFromServer()
    }
  }, [isAuthenticated])

  const activeItems = items.filter((item) => !item.deleted)
  const deletedItems = items.filter((item) => item.deleted)

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, change: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const submitOrder = async () => {
    if (cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total,
      timestamp: new Date(),
      createdBy: currentUser,
    }

    setOrders((prev) => [...prev, newOrder])
    await saveOrderToServer(newOrder)
    setCart([])
  }

  const confirmPayment = async (orderId: number) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setPaymentHistory((prev) => [order, ...prev])
      await saveCompletedOrderToServer(order)
    }
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
    await deleteOrderFromServer(orderId)
  }

  const startEditingPrice = (orderId: number, currentTotal: number) => {
    setEditingOrderId(orderId)
    setEditingTotal(currentTotal.toString())
  }

  const saveEditedPrice = (orderId: number) => {
    const newTotal = Number.parseFloat(editingTotal)
    if (isNaN(newTotal) || newTotal < 0) return

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            originalTotal: order.originalTotal || order.total,
            total: newTotal,
          }
          : order,
      ),
    )
    setEditingOrderId(null)
    setEditingTotal("")
  }

  const cancelEditingPrice = () => {
    setEditingOrderId(null)
    setEditingTotal("")
  }

  const applyDiscount = (orderId: number, percentage: number) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            originalTotal: order.originalTotal || order.total,
            total: (order.originalTotal || order.total) * (1 - percentage / 100),
          }
          : order,
      ),
    )
  }

  const handleImageUpload = async (itemId: number | null, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("image", file)

      // Subir imagen al servidor
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir imagen")
      }

      const { imagePath } = await response.json()

      if (itemId === null) {
        // Para nuevo artículo
        setNewItem((prev) => ({ ...prev, photo: imagePath }))
      } else {
        // Para artículo existente
        setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, photo: imagePath } : item)))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen. Por favor, inténtalo de nuevo.")
    }
  }

  const addNewItem = async () => {
    if (!newItem.name || !newItem.price) return

    const item: Item = {
      id: nextItemId,
      name: newItem.name,
      price: Number.parseFloat(newItem.price),
      photo: newItem.photo || "/placeholder.svg?key=new-item",
      number: nextItemId.toString().padStart(3, "0"),
    }

    const newItems = [...items, item]
    const newNextId = nextItemId + 1

    setItems(newItems)
    setNextItemId(newNextId)
    await saveItemsToServer({ items: newItems, nextItemId: newNextId })

    setNewItem({ name: "", price: "", photo: "" })
    setShowAddForm(false)
  }

  const deleteItem = async (itemId: number) => {
    const newItems = items.map((item) => (item.id === itemId ? { ...item, deleted: true } : item))
    setItems(newItems)
    await saveItemsToServer({ items: newItems, nextItemId })
  }

  const restoreItem = async (itemId: number) => {
    const newItems = items.map((item) => (item.id === itemId ? { ...item, deleted: false } : item))
    setItems(newItems)
    await saveItemsToServer({ items: newItems, nextItemId })
  }

  const updateItem = async (itemId: number, field: keyof Item, value: string | number) => {
    const newItems = items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    setItems(newItems)
    await saveItemsToServer({ items: newItems, nextItemId })
  }

  const exportItemsJSON = () => {
    const dataStr = JSON.stringify({ items, nextItemId }, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "items-config.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importItemsJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items)
          setNextItemId(data.nextItemId || data.items.length + 1)
          await saveItemsToServer(data)
        }
      } catch (error) {
        alert("Invalid JSON file")
      }
    }
    reader.readAsText(file)
  }

  const downloadCompletedOrders = () => {
    const ordersData = {
      completedOrders: paymentHistory,
      exportDate: new Date().toISOString(),
      totalOrders: paymentHistory.length,
      totalRevenue: paymentHistory.reduce((sum, order) => sum + order.total, 0),
    }

    const dataStr = JSON.stringify(ordersData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `completed-orders-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const applyPriceOverride = (orderId: number) => {
    const overrideValue = priceOverride[orderId]
    if (!overrideValue) return

    const newTotal = Number.parseFloat(overrideValue)
    if (isNaN(newTotal) || newTotal < 0) return

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            originalTotal: order.originalTotal || order.total,
            total: newTotal,
          }
          : order,
      ),
    )

    // Clear the override input
    setPriceOverride((prev) => ({ ...prev, [orderId]: "" }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={(username) => {
          setIsAuthenticated(true)
          setCurrentUser(username)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Eva拉丁美食 - Terminal de Ventas</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Bienvenido, {currentUser}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-card border-b">
        {[
          { key: "sales", label: "Ventas", icon: ShoppingCart },
          { key: "payment", label: "Pagos", icon: CreditCard },
          { key: "config", label: "Configuración", icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors min-h-[60px] ${activeTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 pb-20">
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-3 cursor-pointer hover:bg-accent/10 transition-colors active:scale-95 min-h-[140px]"
                  onClick={() => addToCart(item)}
                >
                  <div className="text-center space-y-2 h-full flex flex-col">
                    <img
                      src={item.photo || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-16 sm:h-20 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/generic-food-item.png"
                      }}
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-medium text-sm leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">#{item.number}</p>
                      </div>
                      <p className="text-primary font-bold text-lg">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="p-3 min-h-[140px]">
                <div className="text-center space-y-2 h-full flex flex-col">
                  {!showCustomForm ? (
                    <>
                      <div className="w-full h-16 sm:h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-medium text-sm">Artículo Personalizado</p>
                        <Button
                          size="sm"
                          onClick={() => setShowCustomForm(true)}
                          className="w-full text-xs mt-2"
                          variant="outline"
                        >
                          Añadir Personalizado
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 h-full flex flex-col">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">Artículo Personalizado</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowCustomForm(false)
                            setCustomItem({ description: "", price: "" })
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        type="text"
                        placeholder="Descripción"
                        value={customItem.description}
                        onChange={(e) => setCustomItem((prev) => ({ ...prev, description: e.target.value }))}
                        className="text-xs h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={customItem.price}
                        onChange={(e) => setCustomItem((prev) => ({ ...prev, price: e.target.value }))}
                        className="text-xs h-8"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => handleImageUpload(null, e as any)
                          input.click()
                        }}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Foto
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addCustomItem(cart, setCart, customItem, setCustomItem, setShowCustomForm)}
                        className="w-full text-xs mt-auto"
                        disabled={!customItem.description || !customItem.price}
                      >
                        Añadir al Carrito
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {cart.length > 0 && (
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Pedido Actual</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart([])}
                    className="text-destructive hover:text-destructive"
                  >
                    Limpiar Todo
                  </Button>
                </div>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.isCustom ? "custom" : "regular"}`}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                    >
                      <img
                        src={item.photo || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/generic-food-item.png"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        {item.isCustom && item.description && (
                          <p className="text-xs text-accent">Personalizado: {item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">
                        Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} artículos
                      </p>
                    </div>
                    <Button onClick={submitOrder} className="px-8 py-3 text-base font-medium">
                      Enviar Pedido
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Pedidos Pendientes</h2>
              <div className="text-sm text-muted-foreground">
                {orders.length} pendientes • {paymentHistory.length} completados hoy
              </div>
            </div>

            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos pendientes</p>
                <p className="text-xs text-muted-foreground mt-2">Los pedidos aparecerán aquí después del envío</p>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">Pedido #{order.id.toString().slice(-6)}</p>
                        <p className="text-xs text-muted-foreground">{order.timestamp.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Creado por: {order.createdBy}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                        </p>
                      </div>
                      <div className="text-right">
                        {editingOrderId === order.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingTotal}
                              onChange={(e) => setEditingTotal(e.target.value)}
                              className="w-24 h-8 text-right"
                              step="0.01"
                              min="0"
                            />
                            <Button size="sm" onClick={() => saveEditedPrice(order.id)} className="h-8 w-8 p-0">
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditingPrice} className="h-8 w-8 p-0">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingPrice(order.id, order.total)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {order.originalTotal && order.originalTotal !== order.total && (
                              <p className="text-xs text-muted-foreground line-through">
                                Original: ${order.originalTotal.toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${order.id}-${item.id}-${index}`}
                          className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg"
                        >
                          <img
                            src={item.photo || "/placeholder.svg"}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/generic-food-item.png"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}x ${item.price.toFixed(2)}
                              {item.isCustom && " (Personalizado)"}
                            </p>
                          </div>
                          <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Sobreescribir Precio (Opcional)</p>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Ingrese nuevo precio"
                          value={priceOverride[order.id] || ""}
                          onChange={(e) => setPriceOverride((prev) => ({ ...prev, [order.id]: e.target.value }))}
                          className="flex-1"
                          step="0.01"
                          min="0"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyPriceOverride(order.id)}
                          disabled={!priceOverride[order.id]}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => confirmPayment(order.id)}
                      className="w-full py-3 text-base font-medium"
                      size="lg"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Confirmar Pago - ${order.total.toFixed(2)}
                    </Button>
                  </div>
                </Card>
              ))
            )}

            {paymentHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Pagos Recientes</h3>
                <div className="space-y-2">
                  {paymentHistory.slice(0, 5).map((order) => (
                    <Card key={`history-${order.id}`} className="p-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">Pedido #{order.id.toString().slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">{order.timestamp.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Por: {order.createdBy}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">${order.total.toFixed(2)}</p>
                          {order.originalTotal && order.originalTotal !== order.total && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${order.originalTotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Configuración</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={configView === "items" ? "default" : "outline"}
                  onClick={() => setConfigView("items")}
                  className="flex-1"
                >
                  Artículos Activos ({activeItems.length})
                </Button>
                <Button
                  size="sm"
                  variant={configView === "deleted" ? "default" : "outline"}
                  onClick={() => setConfigView("deleted")}
                  className="flex-1"
                >
                  Artículos Eliminados ({deletedItems.length})
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {showAddForm && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Añadir Nuevo Artículo</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowAddForm(false)
                          setNewItem({ name: "", price: "", photo: "" })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Nombre del artículo"
                          value={newItem.name}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Precio"
                          value={newItem.price}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
                          step="0.01"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => handleImageUpload(null, e as any)
                            input.click()
                          }}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Foto
                        </Button>
                      </div>
                      <div className="flex items-center justify-center">
                        <img
                          src={newItem.photo || "/placeholder.svg?key=new-preview"}
                          alt="Vista previa"
                          className="w-24 h-24 object-cover rounded-md border"
                        />
                      </div>
                    </div>
                    <Button onClick={addNewItem} disabled={!newItem.name || !newItem.price} className="w-full">
                      Añadir Artículo
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {configView === "items" && (
              <div className="space-y-4">
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Nuevo Artículo
                  </Button>
                )}

                <div className="grid gap-4">
                  {activeItems.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.photo || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/generic-food-item.png"
                          }}
                        />
                        <div className="flex-1 space-y-2">
                          {editingItem === item.id ? (
                            <div className="space-y-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                placeholder="Nombre del artículo"
                              />
                              <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value))}
                                placeholder="Precio"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                #{item.number} • ${item.price.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => handleImageUpload(item.id, e as any)
                              input.click()
                            }}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                          >
                            {editingItem === item.id ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {configView === "deleted" && (
              <div className="space-y-4">
                {deletedItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay artículos eliminados</p>
                    <p className="text-xs text-muted-foreground mt-2">Los artículos eliminados aparecerán aquí</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {deletedItems.map((item) => (
                      <Card key={item.id} className="p-4 bg-muted/30">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.photo || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0 opacity-50"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/generic-food-item.png"
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-muted-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              #{item.number} • ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => restoreItem(item.id)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                const allOrders = [...orders, ...paymentHistory]
                const dataStr = JSON.stringify(allOrders, null, 2)
                const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
                const exportFileDefaultName = `pedidos_${new Date().toISOString().split("T")[0]}.json`
                const linkElement = document.createElement("a")
                linkElement.setAttribute("href", dataUri)
                linkElement.setAttribute("download", exportFileDefaultName)
                linkElement.click()
              }}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar JSON de Pedidos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
