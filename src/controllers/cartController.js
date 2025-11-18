let carritos = [];  // TEMPORAL, luego lo pasamos a la base

function crearCarrito(req, res) {
    const { usuarioId } = req.body;

    const nuevoCarrito = {
        id: "c" + Math.floor(Math.random() * 99999),
        usuarioId,
        estado: "ABIERTO",
        items: []
    };

    carritos.push(nuevoCarrito);

    res.status(201).json({
        id: nuevoCarrito.id,
        estado: nuevoCarrito.estado
    });
}

module.exports = { crearCarrito };
