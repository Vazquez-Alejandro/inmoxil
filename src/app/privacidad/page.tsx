import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Inmoxil',
  description: 'Política de privacidad y protección de datos de la plataforma Inmoxil.',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 md:px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-mark">Ix</div>
            <span className="font-bold text-navy-900">Inmoxil</span>
          </Link>
          <Link href="/" className="text-sm text-navy-500 hover:text-navy-900 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Política de Privacidad</h1>
        <p className="text-navy-500 mb-12">Última actualización: Junio 2026</p>

        <div className="prose prose-navy max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">1. Información que Recopilamos</h2>
            <p className="text-navy-700 leading-relaxed mb-3">
              Recopilamos los siguientes tipos de información para prestar y mejorar nuestro servicio:
            </p>
            <ul className="list-disc list-inside text-navy-700 space-y-2 ml-4">
              <li><strong>Datos de registro:</strong> nombre, email, contraseña y datos de la inmobiliaria.</li>
              <li><strong>Datos de facturación:</strong> información de pago procesada por Stripe (no almacenamos datos de tarjetas).</li>
              <li><strong>Datos de uso:</strong> estadísticas de uso de la plataforma, propiedades scrapeadas, ads generados.</li>
              <li><strong>Datos de marca:</strong> logos, colores y elementos visuales subidos por el usuario para la generación de ads.</li>
              <li><strong>Datos importados:</strong> información de propiedades inmobiliarias recopilada de portales públicos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">2. Uso de la Información</h2>
            <p className="text-navy-700 leading-relaxed mb-3">Utilizamos la información recopilada para:</p>
            <ul className="list-disc list-inside text-navy-700 space-y-2 ml-4">
              <li>Prestar y mantener el servicio contratado.</li>
              <li>Procesar pagos y gestionar suscripciones.</li>
              <li>Enviar notificaciones sobre el estado del servicio y actualizaciones.</li>
              <li>Mejorar la experiencia del usuario y desarrollar nuevas funcionalidades.</li>
              <li>Generar estadísticas agregadas y anónimas para mejorar el producto.</li>
              <li>Cumplir obligaciones legales y regulatorias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">3. Cookies</h2>
            <p className="text-navy-700 leading-relaxed">
              Utilizamos cookies esenciales para el funcionamiento de la plataforma, incluyendo cookies de
              autenticación y preferencias de sesión. No utilizamos cookies de rastreo publicitario ni de
              terceros con fines de seguimiento. Las cookies esenciales son necesarias para el correcto
              funcionamiento del servicio y no pueden ser desactivadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">4. Terceros</h2>
            <p className="text-navy-700 leading-relaxed mb-3">Compartimos información únicamente con:</p>
            <ul className="list-disc list-inside text-navy-700 space-y-2 ml-4">
              <li><strong>Stripe:</strong> procesamiento de pagos. Stripe opera bajo sus propias políticas de privacidad.</li>
              <li><strong>AWS:</strong> infraestructura en la nube con certificación SOC 2.</li>
              <li><strong>Autoridades legales:</strong> cuando sea requerido por ley o orden judicial.</li>
            </ul>
            <p className="text-navy-700 leading-relaxed mt-3">
              No vendemos ni compartimos datos personales con terceros con fines de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">5. Seguridad de los Datos</h2>
            <p className="text-navy-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger los datos personales,
              incluyendo encriptación AES-256 en reposo y TLS 1.3 en tránsito, controles de acceso basados en
              roles, monitoreo continuo de seguridad y auditorías regulares. Nuestros servidores están alojados
              en AWS con certificación SOC 2 Tipo II.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">6. Derechos del Usuario</h2>
            <p className="text-navy-700 leading-relaxed mb-3">
              De conformidad con la Ley de Protección de Datos Personales N.º 25.326 de Argentina, los usuarios
              tienen derecho a:
            </p>
            <ul className="list-disc list-inside text-navy-700 space-y-2 ml-4">
              <li>Acceder a sus datos personales.</li>
              <li>Solicitar la rectificación de datos inexactos.</li>
              <li>Solicitar la eliminación de sus datos.</li>
              <li>Oponerse al tratamiento de sus datos.</li>
              <li>Solicitar la portabilidad de sus datos.</li>
              <li>Revocar el consentimiento otorgado.</li>
            </ul>
            <p className="text-navy-700 leading-relaxed mt-3">
              Para ejercer estos derechos, podés contactarnos a través de{' '}
              <a href="mailto:privacidad@inmoxil.com" className="text-gold-600 hover:text-gold-700 underline">
                privacidad@inmoxil.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">7. Retención de Datos</h2>
            <p className="text-navy-700 leading-relaxed">
              Conservamos los datos personales del usuario mientras su cuenta esté activa. Tras la cancelación
              de la cuenta, los datos personales serán eliminados dentro de los 30 días, salvo que exista una
              obligación legal que requiera su conservación. Los datos de scraping se mantienen durante el
              período de suscripción activa y se eliminan tras la cancelación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">8. Cambios en esta Política</h2>
            <p className="text-navy-700 leading-relaxed">
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
              Los cambios serán notificados a través de la plataforma y por email con al menos 15 días de
              aviso previo. El uso continuado del servicio después de la notificación implica la aceptación
              de los cambios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3">9. Contacto</h2>
            <p className="text-navy-700 leading-relaxed">
              Para consultas sobre esta Política de Privacidad o para ejercer tus derechos, podés contactarnos a través de{' '}
              <a href="mailto:privacidad@inmoxil.com" className="text-gold-600 hover:text-gold-700 underline">
                privacidad@inmoxil.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
