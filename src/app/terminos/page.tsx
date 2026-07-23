import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Inmoxil',
  description: 'Términos y condiciones de uso de la plataforma Inmoxil.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <nav className="border-b border-gray-200 dark:border-navy-700 px-6 md:px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-mark">Ix</div>
            <span className="font-bold text-navy-900 dark:text-white">Inmoxil</span>
          </Link>
          <Link href="/" className="text-sm text-navy-600 hover:text-navy-900 transition-colors dark:text-navy-300 dark:hover:text-white">
            Volver al inicio
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4 dark:text-white">Términos de Servicio</h1>
        <p className="text-navy-600 mb-12 dark:text-navy-400">Última actualización: Junio 2026</p>

        <div className="prose prose-navy max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">1. Descripción del Servicio</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Inmoxil es una plataforma en la nube que ofrece herramientas de importación de propiedades inmobiliarias,
              generación de anuncios publicitarios con personalización de marca y sistema de pago por créditos.
              El servicio está dirigido a inmobiliarias, agentes inmobiliarios y profesionales del sector inmobiliario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">2. Aceptación de los Términos</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Al acceder y utilizar la plataforma Inmoxil, el usuario acepta plenamente estos Términos de Servicio.
              Si el usuario no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar el servicio.
              Nos reservamos el derecho de modificar estos términos en cualquier momento, siendo responsabilidad
              del usuario revisar periódicamente los cambios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">3. Obligaciones del Usuario</h2>
            <p className="text-navy-700 leading-relaxed mb-3 dark:text-navy-300 dark:text-navy-100">El usuario se compromete a:</p>
            <ul className="list-disc list-inside text-navy-800 space-y-2 ml-4 dark:text-navy-200">
              <li>Proporcionar información veraz y actualizada durante el registro.</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Utilizar la plataforma de conformidad con la legislación vigente de Argentina.</li>
              <li>No utilizar el servicio para fines ilícitos o que puedan dañar la reputación de Inmoxil.</li>
              <li>No intentar acceder de forma no autorizada a sistemas o datos de otros usuarios.</li>
              <li>Reportar cualquier vulnerabilidad o uso indebido de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">4. Planes y Pagos</h2>
            <p className="text-navy-700 leading-relaxed mb-3 dark:text-navy-300 dark:text-navy-100">
              Inmoxil ofrece diferentes planes de suscripción mensual con distintos niveles de créditos y funcionalidades.
              Los precios están expresados en dólares estadounidenses (USD) y se procesan a través de Stripe.
            </p>
            <ul className="list-disc list-inside text-navy-800 space-y-2 ml-4 dark:text-navy-200">
              <li>Los planes se renuevan automáticamente al final de cada período de facturación.</li>
              <li>El usuario puede cancelar su suscripción en cualquier momento desde su dashboard.</li>
              <li>Los créditos no utilizados no se acumulan para el siguiente período.</li>
              <li>Los precios pueden ser modificados con 30 días de aviso previo.</li>
              <li>Las suscripciones anuales ofrecen un descuento del 20% sobre el precio mensual.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">5. Política de Reembolsos</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Inmoxil ofrece un período de prueba gratuito de 14 días para nuevos usuarios. Después del período de prueba:
            </p>
            <ul className="list-disc list-inside text-navy-800 space-y-2 ml-4 dark:text-navy-200">
              <li>Reembolsos completos se otorgan dentro de los primeros 14 días de pago.</li>
              <li>Después de 14 días, no se ofrecen reembolsos por meses parciales.</li>
              <li>Los reembolsos se procesan en un plazo de 5-10 días hábiles.</li>
              <li>El Usuario debe solicitar el reembolso por email a hola@inmoxil.com.</li>
              <li>Los créditos no utilizados no son reembolsables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">6. Propiedad Intelectual</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Todo el contenido, código fuente, diseño, marcas registradas y materiales de la plataforma Inmoxil
              son propiedad exclusiva de Inmoxil y están protegidos por las leyes de propiedad intelectual de Argentina
              e internacionales. El usuario conserva la propiedad de los datos y contenido que sube a la plataforma.
              Al utilizar el servicio, Inmoxil obtiene una licencia limitada para procesar dichos datos exclusivamente
              con el fin de prestar el servicio contratado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">7. Uso de la Importación de Datos de Terceros</h2>
            <p className="text-navy-700 leading-relaxed mb-3 dark:text-navy-300 dark:text-navy-100">
              La plataforma permite recopilar información de propiedades inmobiliarias publicadas en portales web públicos
              (ZonaProp, Argenprop, MercadoLibre, entre otros). El usuario reconoce y acepta que:
            </p>
            <ul className="list-disc list-inside text-navy-800 space-y-2 ml-4 dark:text-navy-200">
              <li>La importación debe realizarse de buena fe y con fines lícitos, exclusivamente para monitoreo de mercado o gestión de las propias propiedades.</li>
              <li>Queda estrictamente prohibido copiar, reproducir o publicar como propias las publicaciones de otras inmobiliarias o agentes.</li>
              <li>El usuario es el único responsable del uso que le dé a la información obtenida a través de la importación.</li>
              <li>Los portales inmobiliarios pueden modificar sus términos de servicio, estructura HTML o políticas de acceso en cualquier momento, lo que puede afectar la importación.</li>
              <li>Inmoxil no garantiza la exactitud, completitud ni vigencia de los datos importados.</li>
              <li>El usuario debe respetar los términos de servicio de cada portal inmobiliario al que acceda a través de la plataforma.</li>
              <li>Inmoxil no se responsabiliza por cualquier reclamo, sanción o consecuencia legal derivada del uso indebido de la importación por parte del usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">8. Limitación de Responsabilidad</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Inmoxil no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten
              del uso o imposibilidad de uso de la plataforma. No garantizamos la disponibilidad ininterrumpida del
              servicio ni la exactitud de los datos obtenidos mediante la importación. El usuario reconoce que los datos
              de portales inmobiliarios pueden cambiar sin previo aviso y que Inmoxil no controla dichos portales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">9. Terminación</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Inmoxil se reserva el derecho de suspender o terminar la cuenta del usuario en caso de incumplimiento
              de estos términos, con o sin previo aviso. En caso de terminación por parte del usuario, este podrá
              solicitar la exportación de sus datos dentro de los 30 días posteriores a la cancelación. Pasado
              dicho plazo, los datos serán eliminados de conformidad con nuestra Política de Privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">10. Ley Aplicable y Jurisdicción</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Estos Términos de Servicio se rigen por las leyes de la República Argentina. Cualquier controversia
              derivada de la interpretación o ejecución de estos términos será sometida a la jurisdicción de los
              tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy-900 mb-3 dark:text-white">11. Contacto</h2>
            <p className="text-navy-800 leading-relaxed dark:text-navy-200">
              Para consultas sobre estos Términos de Servicio, podés contactarnos a través de{' '}
              <a href="mailto:hola@inmoxil.com" className="text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 underline">
                hola@inmoxil.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
