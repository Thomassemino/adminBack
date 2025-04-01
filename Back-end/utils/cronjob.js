const cron = require('node-cron');
const Cliente = require('../models//clienteSchema');
const { PreApproval } = require('mercadopago');
const mercadopago = require('../config/mercadopago');

/**
 * Verifica clientes con pagos vencidos y actualiza su estado
 */
const verificarPagosVencidos = async () => {
  try {
    console.log('[Cron] Iniciando verificación de pagos vencidos...');
    const hoy = new Date();
    
    // Buscar clientes activos con fecha de próximo pago anterior a hoy
    const clientesConPagosVencidos = await Cliente.find({
      estado: 'activo',
      estadoPagoActual: { $ne: 'vencido' }, // No incluir los que ya están marcados como vencidos
      fechaProximoPago: { $lt: hoy }
    });
    
    console.log(`[Cron] Encontrados ${clientesConPagosVencidos.length} clientes con pagos vencidos`);
    
    // Actualizar estado de cada cliente con pago vencido
    for (const cliente of clientesConPagosVencidos) {
      // Verificar el estado real en MercadoPago (por si el webhook falló)
      if (cliente.suscripcionId) {
        try {
          const suscripcion = await new PreApproval(mercadopago).get({ id: cliente.suscripcionId });
          
          // Si la suscripción está pausada o cancelada en MercadoPago, actualizar estado local
          if (suscripcion.status === 'paused') {
            cliente.estado = 'suspendido';
          } else if (suscripcion.status === 'cancelled') {
            cliente.estado = 'inactivo';
          }
        } catch (mpError) {
          console.error(`[Cron] Error al consultar MercadoPago para cliente ${cliente._id}:`, mpError.message);
          // Continuar con la actualización local aunque falle la consulta a MercadoPago
        }
      }
      
      // Marcar el pago como vencido
      cliente.estadoPagoActual = 'vencido';
      
      // Si está activo por más de X días vencido, suspender la suscripción
      const diasDeGracia = 5; // Configurable: días de gracia antes de suspender
      const diasVencido = Math.floor((hoy - cliente.fechaProximoPago) / (1000 * 60 * 60 * 24));
      
      if (diasVencido > diasDeGracia && cliente.estado === 'activo') {
        console.log(`[Cron] Suspendiendo cliente ${cliente._id} por pago vencido hace ${diasVencido} días`);
        cliente.estado = 'suspendido';
        
        // Suspender suscripción en MercadoPago si existe
        if (cliente.suscripcionId) {
          try {
            await new PreApproval(mercadopago).update({
              id: cliente.suscripcionId,
              status: "paused",
            });
          } catch (mpError) {
            console.error(`[Cron] Error al suspender suscripción en MercadoPago:`, mpError.message);
          }
        }
      }
      
      await cliente.save();
      console.log(`[Cron] Actualizado cliente ${cliente._id}: estadoPagoActual=${cliente.estadoPagoActual}, estado=${cliente.estado}`);
    }
    
    console.log('[Cron] Verificación de pagos vencidos completada');
  } catch (error) {
    console.error('[Cron] Error en verificación de pagos vencidos:', error);
  }
};

/**
 * Envía recordatorios de pago a clientes con pagos próximos a vencer
 * Esta función requeriría implementar un sistema de notificaciones (email, SMS, etc.)
 */
const enviarRecordatoriosPago = async () => {
  try {
    console.log('[Cron] Iniciando envío de recordatorios de pago...');
    const hoy = new Date();
    const diasAnticipacion = 3; // Recordar 3 días antes
    
    // Calcular la fecha límite para enviar recordatorios (hoy + días de anticipación)
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + diasAnticipacion);
    
    // Buscar clientes con próximo pago entre hoy y la fecha límite
    const clientesProximoVencimiento = await Cliente.find({
      estado: 'activo',
      estadoPagoActual: { $ne: 'pagado' }, // No recordar a los que ya pagaron
      fechaProximoPago: { 
        $gte: hoy,
        $lte: fechaLimite
      }
    });
    
    console.log(`[Cron] Encontrados ${clientesProximoVencimiento.length} clientes con pagos próximos a vencer`);
    
    // Aquí implementarías el envío de notificaciones
    // Este es un placeholder - necesitarías integrarlo con un sistema de emails o notificaciones
    for (const cliente of clientesProximoVencimiento) {
      console.log(`[Cron] Enviando recordatorio a cliente ${cliente._id} (${cliente.nombre})`);
      // await enviarEmail(cliente.email, 'Recordatorio de pago', {...});
    }
    
    console.log('[Cron] Envío de recordatorios de pago completado');
  } catch (error) {
    console.error('[Cron] Error en envío de recordatorios:', error);
  }
};

/**
 * Inicializa todos los cron jobs del sistema
 */
const iniciarCronJobs = () => {
  // Verificar pagos vencidos todos los días a las 00:05 AM
  cron.schedule('5 0 * * *', verificarPagosVencidos);
  
  // Enviar recordatorios de pago todos los días a las 10:00 AM
  cron.schedule('0 10 * * *', enviarRecordatoriosPago);
  
  console.log('Cron jobs iniciados');
};

module.exports = {
  iniciarCronJobs,
  verificarPagosVencidos, // Exportado para poder ejecutarlo manualmente si es necesario
  enviarRecordatoriosPago // Exportado para poder ejecutarlo manualmente si es necesario
};