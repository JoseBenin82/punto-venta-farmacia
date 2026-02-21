import { create } from 'zustand';
import { toast } from 'sonner';
import { seleccionarLoteFEFO, ordenarLotesFEFO } from '../models/Lote';

const useCartStore = create((set, get) => ({
    cart: [],
    parkedSale: null, // Only one parked sale for simplicity, could be an array
    total: 0,

    // RF-001 & RF-002: Add to cart with FEFO or manual batch and validations
    addToCart: (producto, cantidad = 1, manualLoteId = null, recetaData = null) => {
        const { cart } = get();
        let selectedLote = null;

        // 1. Select Batch (Lote)
        if (manualLoteId) {
            selectedLote = producto.lotes.find(l => l.id === manualLoteId);
            if (!selectedLote) {
                toast.error('El lote seleccionado no existe.');
                return false;
            }
            // Check if manually selected lot is expired (RF-003)
            if (selectedLote.estaCaducado()) {
                toast.error(`El lote ${selectedLote.numeroLote} está caducado. No se puede vender.`);
                return false;
            }
        } else {
            // FEFO Logic
            selectedLote = seleccionarLoteFEFO(producto.lotes);
            if (!selectedLote) {
                // Check if we have expired lots (for specific error message)
                const hasExpired = producto.lotes.some(l => l.estaCaducado());
                if (hasExpired) {
                    toast.error('Todos los lotes disponibles están caducados o agotados.');
                } else {
                    toast.error('Producto agotado (Sin stock en lotes vigentes).');
                }
                return false;
            }
        }

        // 2. Check Stock availability for the specific batch
        // We need to check how many of THIS batch are already in cart
        const existingItemIndex = cart.findIndex(
            item => item.producto.id === producto.id && item.lote.id === selectedLote.id
        );

        let currentQtyInCart = 0;
        if (existingItemIndex !== -1) {
            currentQtyInCart = cart[existingItemIndex].cantidad;
        }

        if (currentQtyInCart + cantidad > selectedLote.cantidadDisponible) {
            toast.warning(`Stock insuficiente en lote ${selectedLote.numeroLote}. Disponible: ${selectedLote.cantidadDisponible}`);
            return false;
        }

        // 3. Add or Update Cart
        const newCart = [...cart];

        // RF-004: Validate controlled meds data
        if (producto.esControlado() || producto.esAntibiotico()) {
            if (!recetaData && existingItemIndex === -1) {
                // If it's a new item, we need prescription. 
                // If updating quantity, we assume prescription applies to all? 
                // Usually yes, but for strictness, maybe allow passing it again.
                // For now, if adding without data, return specific signal to open modal.
                return 'REQ_RECETA';
            }
        }

        if (existingItemIndex !== -1) {
            newCart[existingItemIndex].cantidad += cantidad;
            // Merge prescription data if provided? usually keep the first one or update.
            if (recetaData) {
                newCart[existingItemIndex].recetaData = recetaData;
            }
            toast.success(`Cantidad actualizada: ${producto.nombre}`);
        } else {
            newCart.push({
                producto,
                lote: selectedLote,
                cantidad,
                recetaData: recetaData || null,
                precio: producto.getPrecioConImpuestos() // Freeze price at moment of add
            });
            toast.success(`Producto agregado: ${producto.nombre}`);
        }

        set({ cart: newCart });
        get().calculateTotal();
        return true;
    },

    removeFromCart: (index) => {
        const { cart } = get();
        const newCart = cart.filter((_, i) => i !== index);
        set({ cart: newCart });
        get().calculateTotal();
    },

    updateQuantity: (index, newQuantity) => {
        const { cart } = get();
        if (newQuantity <= 0) {
            get().removeFromCart(index);
            return;
        }

        const item = cart[index];
        if (newQuantity > item.lote.cantidadDisponible) {
            toast.warning(`No hay suficiente stock en el lote ${item.lote.numeroLote}`);
            return;
        }

        const newCart = [...cart];
        newCart[index].cantidad = newQuantity;
        set({ cart: newCart });
        get().calculateTotal();
    },

    clearCart: () => {
        set({ cart: [], total: 0 });
    },

    // RF-005: Hold/Park Sale
    parkSale: () => {
        const { cart } = get();
        if (cart.length === 0) {
            toast.info("No hay venta para poner en espera");
            return;
        }
        set({ parkedSale: [...cart], cart: [] });
        toast.success("Venta puesta en espera (Parked)");
        get().calculateTotal();
    },

    retrieveParkedSale: () => {
        const { parkedSale, cart } = get();
        if (!parkedSale) {
            toast.info("No hay ventas en espera");
            return;
        }
        if (cart.length > 0) {
            if (!window.confirm("La venta actual se perderá. ¿Deseas recuperar la venta en espera?")) {
                return;
            }
        }
        set({ cart: [...parkedSale], parkedSale: null });
        toast.success("Venta recuperada");
        get().calculateTotal();
    },

    calculateTotal: () => {
        const { cart } = get();
        const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        set({ total });
    }
}));

export default useCartStore;
