'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { PlusCircle, MinusCircle, Camera, Upload, Download, Trash2, LogOut, Lock, FileText, ScanLine, Edit, Save, X, ImageOff, DollarSign, Check, RotateCcw } from 'lucide-react'
import { time } from 'console'

interface Item {
  id: number
  name: string
  price: number
  photo: string
  number: string
}

interface OrderItem extends Item {
  quantity: number
}

interface Order {
  items: OrderItem[]
  total_original: number
  total: number
  timestampz: Date
  customerName?: string
  status?: string
}

export default function SalesTerminal() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Core data state
  const [items, setItems] = useState<Item[]>([])
  const [deletedItems, setDeletedItems] = useState<Item[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [paymentHistory, setPaymentHistory] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])

  // Form state
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    photo: '/placeholder.svg?key=new-item', 
    number: '' 
  })
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', number: '' })

  // Import/Export state
  const [jsonData, setJsonData] = useState('')
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // OCR state
  const [ocrText, setOcrText] = useState('')
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)

  // Payment state
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [discount, setDiscount] = useState('')
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ocrInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('[v0] Authentication status changed:', isAuthenticated)
    if (isAuthenticated) {
      loadDataFromServer()
    }
  }, [isAuthenticated])

  useEffect(() => {
    verifySession()
  }, [])

  const verifySession = async () => {
    console.log('[v0] Starting session verification')
    try {
      const response = await fetch('/api/auth/verify')
      const data = await response.json()
      console.log('[v0] Session verification response:', data)
      console.log('[v0] User authenticated:', data.authenticated)
      if (data.authenticated) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('[v0] Session verification failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        setUsername('')
        setPassword('')
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      setItems([])
      setDeletedItems([])
      setOrders([])
      setPaymentHistory([])
      setCurrentOrder([])
      setCustomerName('')
      setSearchTerm('')
      setSelectedCategory('all')
    } catch (error) {
      console.error('Error en logout:', error)
    }
  }

  const loadDataFromServer = async () => {
    console.log('[v0] Loading data from server...')
    setLoading(true)
    
    try {
      const [itemsRes, deletedRes, ordersRes, completedRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/deleted-items'),
        fetch('/api/orders'),
        fetch('/api/completed-orders'),
      ])

      console.log('[v0] API responses:', {
        itemsStatus: itemsRes.status,
        deletedStatus: deletedRes.status,
        ordersStatus: ordersRes.status,
        completedStatus: completedRes.status,
      })

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        console.log('[v0] Loaded items from server:', itemsData.items?.length || 0)
        setItems(itemsData.items || [])
      }

      if (deletedRes.ok) {
        const deletedData = await deletedRes.json()
        console.log('[v0] Loaded deleted items from server:', deletedData.items?.length || 0)
        setDeletedItems(deletedData.items || [])
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        console.log("ORDERS_DATA")
        console.log(ordersData)
        console.log('[v0] Loaded orders from server:', ordersData.length || 0)
        if (ordersData.length > 0) {
          setOrders(
            ordersData.map((order: any) => ({
              ...order,
              timestampz: order.timestampz,
            })),
          )
        }
      }

      if (completedRes.ok) {
        const completedData = await completedRes.json()
        console.log('[v0] Loaded completed orders from server:', completedData.length || 0)
        if( completedData.length > 0 ) {
          setPaymentHistory(
            completedData.map((order: any) => ({
              ...order,
              timestampz: order.timestampz,
            })),
          )
        }
      }
    } catch (error) {
      console.error('[v0] Failed to load data from server:', error)
      setItems([
        { id: 1, name: 'Coffee', price: 3.5, photo: '/coffee-cup.png', number: '001' },
        { id: 2, name: 'Sandwich', price: 8.99, photo: '/classic-sandwich.png', number: '002' },
        { id: 3, name: 'Salad', price: 12.5, photo: '/fresh-salad.png', number: '003' },
        { id: 4, name: 'Juice', price: 4.25, photo: '/glass-of-orange-juice.png', number: '004' },
        { id: 5, name: 'Pastry', price: 5.75, photo: '/assorted-pastries.png', number: '005' },
        { id: 6, name: 'Tea', price: 2.99, photo: '/elegant-tea-cup.png', number: '006' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const saveItemsToServer = async (itemsArray: any[]) => {
    console.log('[v0] Saving items to server:', itemsArray.length)
    try {
      for (const item of itemsArray) {
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        console.log('[v0] Save item response:', response.status)
      }
      // Reload items after saving
      await loadDataFromServer()
    } catch (error) {
      console.error('[v0] Failed to save items to server:', error)
      setError('Error guardando productos')
    }
  }

  const addItem = () => {
    const price = parseFloat(newItem.price)
    if (newItem.name && !isNaN(price) && price > 0) {
      // Auto-generate number if not provided
      const number = newItem.number || String(items.length + 1).padStart(3, '0')
      
      const itemToSave = {
        name: newItem.name,
        price: price,
        photo: newItem.photo,
        number: number,
      }
      
      saveItemsToServer([itemToSave])
      setNewItem({ name: '', price: '', photo: '/placeholder.svg?key=new-item', number: '' })
      setIsAddingItem(false)
      setOcrText('')
    }
  }

  const startEditItem = (item: Item) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      price: item.price.toString(),
      number: item.number
    })
  }

  const saveEditItem = async () => {
    if (!editingItem) return
    
    const price = parseFloat(editForm.price)
    if (editForm.name && !isNaN(price) && price > 0) {
      try {
        const response = await fetch(`/api/items?id=${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editForm.name,
            price: price,
            number: editForm.number || editingItem.number
          }),
        })
        
        if (response.ok) {
          await loadDataFromServer()
          setEditingItem(null)
        }
      } catch (error) {
        console.error('Failed to update item:', error)
      }
    }
  }

  const removeItem = async (id: number) => {
    try {
      // Move to deleted_items instead of permanent deletion
      const response = await fetch(`/api/items?id=${id}&action=delete`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await loadDataFromServer()
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const restoreItem = async (id: number) => {
    try {
      const response = await fetch(`/api/deleted-items?id=${id}&action=restore`, {
        method: 'POST',
      })
      if (response.ok) {
        await loadDataFromServer()
      }
    } catch (error) {
      console.error('Failed to restore item:', error)
    }
  }

  const permanentlyDeleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/deleted-items?id=${id}&action=permanent`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await loadDataFromServer()
      }
    } catch (error) {
      console.error('Failed to permanently delete item:', error)
    }
  }

  const addToOrder = (item: Item) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id)
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem =>
        orderItem.id === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ))
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }])
    }
  }

  const removeFromOrder = (id: number) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === id)
    if (existingItem && existingItem.quantity > 1) {
      setCurrentOrder(currentOrder.map(orderItem =>
        orderItem.id === id
          ? { ...orderItem, quantity: orderItem.quantity - 1 }
          : orderItem
      ))
    } else {
      setCurrentOrder(currentOrder.filter(orderItem => orderItem.id !== id))
    }
  }

  const clearOrder = () => {
    setCurrentOrder([])
    setCustomerName('')
    setAmountReceived('')
  }

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateChange = () => {
    const total = calculateTotal()
    const received = parseFloat(amountReceived) || 0
    return received - total
  }

  const processPayment = async () => {
    if (currentOrder.length === 0) return
    
    const order: Order = {
      // id: 0, // Temporary ID, will be set by the server
      items: [...currentOrder],
      total: calculateTotal(),
      total_original: calculateTotal(),
      timestampz: new Date().toISOString(),
      customerName: customerName || 'Cliente',
      status: 'pending'
    }
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      
      if (response.ok) {
        setOrders([order, ...orders])
        clearOrder()
        console.log('[v0] Order registered successfully')
      }
    } catch (error) {
      console.error('[v0] Failed to register order:', error)
      setError('Error registrando pedido')
    }
  }

  const confirmPayment = async (orderTimestampz: string) => {
    try {
      console.log('Confirming payment for order:', orderTimestampz)
      const response = await fetch(`/api/orders/${orderTimestampz}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', timestampz: orderTimestampz }),
      })
      console.log('Payment confirmation response status:', response.status)
      if (response.ok) {
        const completedOrder = orders.find(o => o.timestampz === orderTimestampz)
        if (completedOrder) {
          setPaymentHistory([{...completedOrder, status: 'completed'}, ...paymentHistory])
          setOrders(orders.filter(o => o.timestampz !== orderTimestampz))
        }
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error)
    }
  }

  // const applyDiscount = (orderTimestampz: string, discountPercent: number) => {
  //   setOrders(orders.map(order => 
  //     order.timestampz === orderTimestampz 
  //       ? {...order, total: order.total * (1 - discountPercent / 100)}
  //       : order
  //   ))
  // }

  const removeItemImage = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: '/placeholder.svg?key=new-item'
        }),
      })
      
      if (response.ok) {
        await loadDataFromServer()
      }
    } catch (error) {
      console.error('Failed to remove image:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewItem({ ...newItem, photo: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editingItem) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const response = await fetch(`/api/items?id=${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...editingItem,
              photo: e.target?.result as string
            }),
          })
          
          if (response.ok) {
            await loadDataFromServer()
          }
        } catch (error) {
          console.error('Failed to update image:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const processOCR = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingOCR(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setOcrText(data.text || '')
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      setError('Error procesando OCR')
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const importFromJSON = () => {
    try {
      const data = JSON.parse(jsonData)
      if (Array.isArray(data)) {
        const validItems = data.filter(item => 
          item.name && typeof item.price === 'number' && item.price > 0
        ).map((item, index) => ({
          name: item.name,
          price: item.price,
          photo: item.photo || '/placeholder.svg?key=new-item',
          number: item.number || String(items.length + index + 1).padStart(3, '0')
        }))
        
        if (validItems.length > 0) {
          saveItemsToServer(validItems)
          setJsonData('')
          setIsImportDialogOpen(false)
        }
      }
    } catch (error) {
      setError('JSON inválido')
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'items.json'
    link.click()
  }

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number?.includes(searchTerm)
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Eva拉丁美食 - Terminal de Ventas
            </CardTitle>
            <p className="text-gray-600">Por favor inicia sesión para continuar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Eva拉丁美食 - Terminal de Ventas</h1>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="float-right"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Tabs defaultValue="pos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pos">Terminal POS</TabsTrigger>
            <TabsTrigger value="items">Gestión de Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            {/* <TabsTrigger value="history">Historial</TabsTrigger> */}
          </TabsList>

          <TabsContent value="pos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Productos Disponibles</CardTitle>
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Cargando productos...</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => addToOrder(item)}
                          >
                            <CardContent className="p-3">
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="w-full h-20 object-cover rounded mb-2"
                              />
                              <h3 className="font-medium text-sm">{item.name}</h3>
                              <p className="text-xs text-gray-500">#{item.number}</p>
                              <p className="text-lg font-bold text-blue-600">${(item.price || 0).toFixed(2)}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Pedido Actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customerName">Cliente</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      
                      <ScrollArea className="h-60">
                        {currentOrder.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No hay productos en el pedido</p>
                        ) : (
                          <div className="space-y-2">
                            {currentOrder.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  <p className="text-blue-600">${(item.price || 0).toFixed(2)} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromOrder(item.id)}
                                  >
                                    <MinusCircle className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToOrder(item)}
                                  >
                                    <PlusCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        
                        <div>
                          <Label htmlFor="amountReceived">Cantidad Recibida</Label>
                          <Input
                            id="amountReceived"
                            type="number"
                            step="0.01"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder="0.00"
                          />
                          {amountReceived && (
                            <p className="text-sm mt-1">
                              Cambio: ${calculateChange().toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={processPayment}
                            disabled={currentOrder.length === 0}
                            className="flex-1"
                          >
                            Registrar Pedido
                          </Button>
                          <Button
                            onClick={clearOrder}
                            variant="outline"
                            disabled={currentOrder.length === 0}
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Productos</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Download className="h-4 w-4 mr-2" />Importar JSON</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Importar desde JSON</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={jsonData}
                          onChange={(e) => setJsonData(e.target.value)}
                          placeholder="Pega aquí el JSON con los productos..."
                          rows={10}
                        />
                        <div className="flex gap-2">
                          <Button onClick={importFromJSON}>Importar</Button>
                          <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button onClick={exportToJSON} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />Exportar JSON
                  </Button>
                  
                  <Button onClick={() => setIsAddingItem(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />Agregar Producto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingItem && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Nuevo Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={newItem.number}
                          placeholder="Se genera automáticamente si se deja vacío"
                          onChange={(e) => setNewItem({...newItem, number: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Foto</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                          >
                            <Camera className="h-4 w-4 mr-2" />Subir Imagen
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <img
                          src={newItem.photo}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded mt-2"
                        />
                      </div>
                      <div>
                        <Label>OCR - Extraer texto de imagen</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => ocrInputRef.current?.click()}
                            variant="outline"
                            disabled={isProcessingOCR}
                          >
                            <ScanLine className="h-4 w-4 mr-2" />
                            {isProcessingOCR ? 'Procesando...' : 'Escanear Imagen'}
                          </Button>
                          <input
                            ref={ocrInputRef}
                            type="file"
                            accept="image/*"
                            onChange={processOCR}
                            className="hidden"
                          />
                        </div>
                        {ocrText && (
                          <div className="mt-2">
                            <Label>Texto extraído:</Label>
                            <Textarea
                              value={ocrText}
                              onChange={(e) => setOcrText(e.target.value)}
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addItem}>Agregar</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingItem(false)
                            setNewItem({ name: '', price: '', photo: '/placeholder.svg?key=new-item', number: '' })
                            setOcrText('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="relative">
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editFileInputRef.current?.click()}
                            >
                              <Camera className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeItemImage(item.id)}
                            >
                              <ImageOff className="h-3 w-3" />
                            </Button>
                          </div>
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            className="hidden"
                          />
                        </div>
                        
                        {editingItem?.id === item.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                            />
                            <Input
                              value={editForm.number}
                              onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={saveEditItem}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">#{item.number}</p>
                            <p className="text-lg font-bold text-blue-600 mb-2">${(item.price || 0).toFixed(2)}</p>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => startEditItem(item)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      El producto se moverá a elementos eliminados y podrá ser restaurado.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeItem(item.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {deletedItems.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Productos Eliminados ({deletedItems.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {deletedItems.map((item) => (
                        <Card key={item.id} className="opacity-75">
                          <CardContent className="p-4">
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="w-full h-32 object-cover rounded mb-2 grayscale"
                            />
                            <h3 className="font-medium text-gray-600">{item.name}</h3>
                            <p className="text-sm text-gray-500">#{item.number}</p>
                            <p className="text-lg font-bold text-gray-500 mb-2">${(item.price || 0).toFixed(2)}</p>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => restoreItem(item.id)}>
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restaurar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar permanentemente?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. El producto se eliminará permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => permanentlyDeleteItem(item.id)}>
                                      Eliminar Permanentemente
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Pendientes ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay pedidos pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Pedido #{order.id}</p>
                              <p className="text-sm text-gray-500">
                                {order.timestampz.toLocaleString()}
                              </p>
                              {order.customerName && (
                                <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                              )}
                            </div>
                            <Badge variant="secondary">${order.total.toFixed(2)}</Badge>
                          </div>
                          <div className="space-y-1 mb-3">
                            {order.items.map((item, index) => (
                              <p key={index} className="text-sm">
                                {item.name} x{item.quantity} - ${((item.price || 0) * item.quantity).toFixed(2)}
                              </p>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 items-center">
                            {/* <Input
                              type="number"
                              placeholder="% Descuento"
                              className="w-24"
                              onChange={(e) => {
                                const discount = parseFloat(e.target.value) || 0
                                if (discount >= 0 && discount <= 100) {
                                  applyDiscount(order.timestampz, discount)
                                }
                              }}
                            /> */}
                            <Button
                              size="sm"
                              onClick={() => confirmPayment(order.timestampz)}
                              className="flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Confirmar Pago
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas ({paymentHistory.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay ventas registradas</p>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {paymentHistory.map((sale) => (
                        <Card key={sale.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">Venta #{sale.id}</p>
                                <p className="text-sm text-gray-500">
                                  {sale.timestampz.toLocaleString()}
                                </p>
                                {sale.customerName && (
                                  <p className="text-sm text-gray-600">Cliente: {sale.customerName}</p>
                                )}
                              </div>
                              <Badge>${sale.total.toFixed(2)}</Badge>
                            </div>
                            <div className="space-y-1">
                              {sale.items.map((item, index) => (
                                <p key={index} className="text-sm">
                                  {item.name} x{item.quantity} - ${((item.price || 0) * item.quantity).toFixed(2)}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}