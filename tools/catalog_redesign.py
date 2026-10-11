"""Brand-led home and buyer-facing demo vocabulary; no backend changes."""
import json
from pathlib import Path

def apply_redesign(data):
    codes = ['de','en','es','fr','ar','bs']
    def add(key,*values):
        assert len(values)==6, key
        data['ui'][key]=dict(zip(codes,values))
    add('heroTitle','Digitale Lösungen.\nFür Ihr Unternehmen.','Digital solutions.\nBuilt around your business.','Soluciones digitales.\nPara tu empresa.','Des solutions digitales.\nPour votre entreprise.','حلول رقمية.\nلأعمالك.','Digitalna rješenja.\nZa vaš posao.')
    add('heroCopy','Wir sind LogoBoss AI. Wir gestalten Websites und verbinden Textchat, Arbeitsabläufe und Hosting zu passenden Lösungen für kleine Unternehmen. Persönlich geplant, verständlich erklärt und auf Ihren Betrieb abgestimmt.','We are LogoBoss AI. We build websites and connect text chat, workflows and hosting into practical solutions for small businesses. Personally planned, clearly explained and tailored to the way you work.','Somos LogoBoss AI. Creamos sitios web y conectamos chat de texto, procesos y hosting en soluciones para pequeñas empresas. Planificadas personalmente y adaptadas a tu negocio.','Nous sommes LogoBoss AI. Nous créons des sites et relions chat textuel, processus et hébergement pour les petites entreprises. Des solutions expliquées clairement et adaptées à votre activité.','نحن LogoBoss AI. نصمم المواقع ونربط المحادثة النصية ومسارات العمل والاستضافة بحلول مناسبة للشركات الصغيرة، بتخطيط شخصي وشرح واضح يناسب نشاطك.','Mi smo LogoBoss AI. Izrađujemo web stranice i povezujemo tekstualni chat, radne tokove i hosting u praktična rješenja za male firme. Lično planirano, jasno objašnjeno i prilagođeno vašem poslu.')
    add('globeHint','Wählen Sie ein Symbol. Jede Leistung öffnet ihre eigene Seite.','Choose an icon. Every service opens its own page.','Elige un icono. Cada servicio abre su propia página.','Choisissez une icône. Chaque service ouvre sa propre page.','اختر أيقونة لفتح صفحة الخدمة.','Odaberite ikonicu. Svaka usluga otvara svoju stranicu.')
    add('globeLabel','Unsere digitalen Leistungen','Our digital services','Nuestros servicios digitales','Nos services numériques','خدماتنا الرقمية','Naše digitalne usluge')
    add('pauseGlobe','Globus pausieren','Pause globe','Pausar globo','Mettre le globe en pause','إيقاف حركة الكرة','Zaustavi globus')
    add('resumeGlobe','Globus fortsetzen','Resume globe','Reanudar globo','Relancer le globe','استئناف حركة الكرة','Pokreni globus')
    add('aboutTitle','Von Ihrer Idee zu einem klaren digitalen Auftritt.','From your idea to a clear digital presence.','De tu idea a una presencia digital clara.','De votre idée à une présence numérique claire.','من فكرتك إلى حضور رقمي واضح.','Od vaše ideje do preglednog digitalnog nastupa.')
    add('aboutCopy','Wir beginnen mit Ihrem Unternehmen: Was bieten Sie an, wie erreichen Kunden Sie und was soll im Alltag einfacher werden? Daraus entwickeln wir einen passenden Auftritt und verbinden nur die vereinbarten Funktionen.','We start with your business: what you offer, how customers reach you and what should become easier day to day. From there we design your presence and connect the functions agreed for your project.','Empezamos por tu empresa: qué ofreces, cómo te contactan tus clientes y qué quieres simplificar. Diseñamos tu presencia y conectamos las funciones acordadas para tu proyecto.','Nous partons de votre activité : votre offre, le contact client et les tâches à simplifier. Nous créons votre présence et relions les fonctions convenues pour votre projet.','نبدأ بفهم نشاطك وخدماتك وطريقة تواصل العملاء معك وما تريد تبسيطه، ثم نصمم حضورك ونربط الوظائف المتفق عليها لمشروعك.','Počinjemo od vaše firme: šta nudite, kako vas klijenti kontaktiraju i šta treba olakšati u svakodnevnom radu. Zatim oblikujemo nastup i povezujemo dogovorene funkcije.')
    add('visualLabel','Gestaltungsbeispiel','Design example','Ejemplo de diseño','Exemple de design','مثال تصميم','Primjer dizajna')
    add('visualAlt','Realistisches Gestaltungsbeispiel für','Realistic design example for','Ejemplo de diseño realista de','Exemple de design réaliste pour','مثال تصميم واقعي لباقة','Realističan prikaz dizajna za')
    add('visualNote','Illustrativer Entwurf. Ihr Design wird an Ihr Unternehmen angepasst.','Illustrative concept. Your design is tailored to your business.','Concepto ilustrativo. El diseño se adapta a tu empresa.','Concept illustratif. Le design s’adapte à votre entreprise.','تصور توضيحي؛ يتم تخصيص التصميم لنشاطك.','Ilustrativni prikaz. Dizajn se prilagođava vašoj firmi.')
    add('flowTitle','So greifen die Funktionen ineinander.','How the functions work together.','Así se conectan las funciones.','Comment les fonctions se relient.','كيف تعمل الوظائف معًا.','Kako su funkcije povezane.')
    add('flowCopy','Ein verständlicher Ablauf vom ersten Kontakt bis zum nächsten Schritt. Die genauen Verbindungen werden vor der Einrichtung abgestimmt.','A clear process from the first contact to the next step. The exact connections are agreed before setup.','Un proceso claro del primer contacto al siguiente paso. Las conexiones se acuerdan antes de configurar.','Un parcours clair du premier contact à l’étape suivante. Les connexions sont convenues avant la configuration.','مسار واضح من أول تواصل إلى الإجراء التالي؛ يتم الاتفاق على الربط قبل الإعداد.','Jasan proces od prvog kontakta do sljedećeg koraka. Tačna povezivanja dogovaraju se prije podešavanja.')
    add('visitSite','Website besuchen','Visit website','Visitar la web','Visiter le site','زيارة الموقع','Posjeta stranici')
    add('seeServices','Leistungen ansehen','See services','Ver servicios','Voir les services','عرض الخدمات','Pregled usluga')
    add('sendRequest','Anfrage stellen','Make an inquiry','Enviar consulta','Envoyer une demande','إرسال طلب','Pošalji upit')
    add('teamFollowup','Ihr Team übernimmt','Your team follows up','Tu equipo responde','Votre équipe prend le relais','يتابع فريقك الطلب','Vaš tim preuzima')
    add('askQuestion','Frage im Textchat','Ask in text chat','Pregunta por chat','Question par chat','سؤال عبر المحادثة النصية','Pitanje u chatu')
    add('approvedAnswer','Freigegebene Antwort','Approved answer','Respuesta aprobada','Réponse validée','إجابة معتمدة','Odobreni odgovor')
    add('protectedLogin','Geschützt anmelden','Protected sign-in','Acceso protegido','Connexion protégée','تسجيل دخول محمي','Zaštićena prijava')
    add('nextStep','Nächster Schritt','Next step','Siguiente paso','Étape suivante','الخطوة التالية','Sljedeći korak')
    add('domainConnect','Domain verbinden','Connect domain','Conectar dominio','Relier le domaine','ربط النطاق','Poveži domenu')
    add('websiteOnline','Website erreichbar','Website accessible','Web accesible','Site accessible','الموقع متاح للزوار','Stranica dostupna')
    add('demoBuilderTitle','Ihr Unternehmen. Als Beispiel.','Your business. As a preview.','Tu empresa. Como ejemplo.','Votre entreprise. En aperçu.','شركتك في عرض تجريبي.','Vaša firma. Kao primjer.')
    add('demoBuilderCopy','Geben Sie Ihren Firmennamen und Ihre Branche ein. Sehen Sie, wie dieses Paket für Ihr Unternehmen aussehen könnte.','Enter your business name and industry. See how this package could look for your business.','Escribe el nombre de tu empresa y el sector. Mira cómo podría verse este paquete para tu negocio.','Indiquez le nom et le secteur de votre entreprise. Découvrez un aperçu de ce forfait pour votre activité.','أدخل اسم شركتك ونوع النشاط لترى كيف يمكن أن تبدو هذه الباقة لعملك.','Upišite naziv firme i djelatnost. Pogledajte kako bi ovaj paket mogao izgledati za vaš posao.')
    add('businessName','Firmenname','Business name','Nombre de empresa','Nom de l’entreprise','اسم الشركة','Naziv firme')
    add('businessType','Branche','Industry','Sector','Secteur','نوع النشاط','Djelatnost')
    add('businessCity','Ort (optional)','City (optional)','Ciudad (opcional)','Ville (facultatif)','المدينة (اختياري)','Grad (opcionalno)')
    add('accentColor','Akzentfarbe','Accent color','Color de acento','Couleur d’accent','اللون الأساسي','Boja detalja')
    add('buildDemo','Mein Beispiel erstellen','Create my preview','Crear mi ejemplo','Créer mon aperçu','إنشاء العرض التجريبي','Napravi moj primjer')
    add('personalDemoNote','Lokales Gestaltungsbeispiel mit Musterdaten. Keine Veröffentlichung, Buchung oder Nachricht. Ihr Projekt wird nach Absprache gestaltet; Funktionen hängen vom gewählten Paket ab.','Local design preview with sample data. Nothing is published, booked or sent. Your project is designed by agreement; functions depend on the selected package.','Vista previa local con datos de ejemplo. No se publica, reserva ni envía nada. El proyecto se diseña según lo acordado y las funciones dependen del paquete.','Aperçu local avec données fictives. Aucune publication, réservation ou transmission. Le projet est conçu selon accord ; les fonctions dépendent du forfait.','عرض تصميم محلي ببيانات نموذجية، دون نشر أو حجز أو إرسال. يتم تخصيص المشروع بالاتفاق وتعتمد الوظائف على الباقة المختارة.','Lokalni prikaz s oglednim podacima. Ništa se ne objavljuje, rezerviše niti šalje. Projekat se oblikuje po dogovoru, a funkcije zavise od odabranog paketa.')
    add('previewReady','Ihr Beispiel ist bereit.','Your preview is ready.','Tu ejemplo está listo.','Votre aperçu est prêt.','العرض التجريبي جاهز.','Vaš primjer je spreman.')
    add('previewDesktop','Desktop','Desktop','Ordenador','Ordinateur','الكمبيوتر','Računar')
    add('previewPhone','Mobil','Mobile','Móvil','Mobile','الهاتف','Telefon')
    add('previewWorkspace','Arbeitsbereich','Workspace','Panel de trabajo','Espace de travail','مساحة العمل','Radni prostor')
    add('previewWebsite','Website','Website','Sitio web','Site web','الموقع','Web stranica')
    add('previewTip','Name, Farben, Inhalte und Aufbau können nach Absprache angepasst werden. Dieses Beispiel ist keine fertig eingerichtete Kundenwebsite.','Name, colors, content and layout can be customized by agreement. This preview is not a configured customer website.','Nombre, colores, contenido y estructura se adaptan por acuerdo. Este ejemplo no es una web de cliente ya configurada.','Nom, couleurs, contenu et structure sont adaptables selon accord. Cet aperçu n’est pas un site client déjà configuré.','يمكن تخصيص الاسم والألوان والمحتوى والتصميم بالاتفاق؛ هذا مثال وليس موقع عميل مجهزًا.','Naziv, boje, sadržaj i raspored prilagođavaju se po dogovoru. Ovaj primjer nije već podešena klijentska stranica.')
    add('hotel','Hotel','Hotel','Hotel','Hôtel','فندق','Hotel')
    add('salon','Salon','Salon','Salón','Salon','صالون','Salon')
    add('restaurant','Restaurant / Café','Restaurant / café','Restaurante / cafetería','Restaurant / café','مطعم / مقهى','Restoran / kafić')
    add('workshop','Werkstatt','Auto service','Taller','Garage','ورشة سيارات','Auto servis')
    add('clinic','Praxis','Clinic','Clínica','Cabinet médical','عيادة','Ordinacija')
    add('consulting','Dienstleistung','Professional services','Servicios profesionales','Services professionnels','خدمات مهنية','Poslovne usluge')
    add('hospitalityHero','Ein Aufenthalt, der zu Ihnen passt.','A stay designed around you.','Una estancia a tu medida.','Un séjour à votre image.','إقامة تناسبك.','Boravak prilagođen vama.')
    add('serviceHero','Persönlicher Service. Klar vorgestellt.','Personal service. Clearly presented.','Atención personal. Servicios claros.','Un service personnel. Une offre claire.','خدمة شخصية وعرض واضح.','Lična usluga. Jasno predstavljena.')
    add('designIncluded','Im gewählten Paket','In this package','En este paquete','Dans ce forfait','ضمن هذه الباقة','U ovom paketu')
    add('sampleAction','Beispielanfrage ansehen','View sample inquiry','Ver consulta de ejemplo','Voir une demande fictive','عرض طلب نموذجي','Pogledaj ogledni upit')
    add('previewChanged','Ansicht gewechselt. Nur ein Gestaltungsbeispiel.','View changed. This is a design preview.','Vista cambiada. Es un ejemplo de diseño.','Vue modifiée. Il s’agit d’un aperçu de design.','تم تغيير العرض، وهو مثال تصميم فقط.','Prikaz promijenjen. Ovo je primjer dizajna.')
    data['ui']['photoNote']=data['ui']['visualNote'].copy()
    flow={
      'digital-start':['visitSite','seeServices','sendRequest','teamFollowup'],
      'web-business':['visitSite','requestTime','inbox','teamFollowup'],
      'web-pro':['visitSite','protectedLogin','inbox','status'],
      'ai-business':['askQuestion','approvedAnswer','contactCapture','inbox'],
      'ai-pro':['askQuestion','approvedAnswer','contactCapture','teamFollowup'],
      'automation-start':['workflow1','workflow2','workflow3','workflow4'],
      'automation-business':['workflow1','workflow2','inProgress','workflow4'],
      'company-os-start':['protectedLogin','inbox','status','nextStep'],
      'hosting-web':['domainConnect','storage','websites','websiteOnline'],
      'hosting-wordpress':['websites','storage','inProgress','nextStep'],
      'hosting-apps':['domainConnect','storage','inProgress','nextStep'],
      'hosting-domains':['domain','domainConnect','websites','websiteOnline'],
      'hosting-email':['domain','domainConnect','email','inbox']
    }
    types={'digital-start':'consulting','web-business':'hotel','web-pro':'workshop','ai-business':'clinic','ai-pro':'restaurant','automation-start':'consulting','automation-business':'hotel','company-os-start':'salon','hosting-web':'restaurant','hosting-wordpress':'hotel','hosting-apps':'consulting','hosting-domains':'clinic','hosting-email':'workshop'}
    for package in data['packages']:
        package['visual']='/assets/previews/'+package['id']+'.webp'
        package['flow']=flow[package['id']]
        package['businessType']=types[package['id']]
    translation_file=Path(__file__).with_name('catalog-it-pt.json')
    if translation_file.exists():
        translations=json.loads(translation_file.read_text())
        for code,entries in translations.items():
            for dotted,text in entries.items():
                parts=dotted.split('.')
                if parts[0]=='packages':
                    item=next(p for p in data['packages'] if p['id']==parts[1]);item[parts[2]][code]=text
                elif parts[0]=='groups':data['groups'][parts[1]][parts[2]][code]=text
                else:data[parts[0]][parts[1]][code]=text
        data['languages'].extend([dict(code='it',name='Italiano',locale='it-IT'),dict(code='pt',name='Português',locale='pt-PT')])
        order=['de','en','fr','es','it','pt','ar','bs']
        data['languages'].sort(key=lambda item:order.index(item['code']))
    return data
