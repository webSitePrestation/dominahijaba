<?php
/**
 * send_contact.php – Milla Alpha ♛
 * Formulaire de contact avec PHPMailer
 *
 * Installation PHPMailer via Composer :
 *   composer require phpmailer/phpmailer
 * Ou télécharger manuellement dans /vendor/phpmailer/
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Adapter le chemin si besoin

// ── Configuration – à modifier ──────────────────────────
define('SMTP_HOST',   'smtp.gmail.com');          // Serveur SMTP
define('SMTP_USER',   'votre_email@gmail.com');   // Email expéditeur
define('SMTP_PASS',   'votre_mot_de_passe_app');  // Mot de passe d'application
define('SMTP_PORT',   587);                        // 587 = TLS / 465 = SSL
define('MAIL_TO',     'votre_email@gmail.com');   // Email de réception (le vôtre)
define('MAIL_FROM',   'noreply@votre-domaine.fr'); // Email affiché expéditeur
// ────────────────────────────────────────────────────────

header('Content-Type: text/plain; charset=UTF-8');

// Méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Validation des champs requis
$prenom       = trim(htmlspecialchars($_POST['prenom']       ?? '', ENT_QUOTES, 'UTF-8'));
$email        = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$type_seance  = trim(htmlspecialchars($_POST['type_seance']  ?? '', ENT_QUOTES, 'UTF-8'));
$disponibilites = trim(htmlspecialchars($_POST['disponibilites'] ?? '', ENT_QUOTES, 'UTF-8'));
$message      = trim(htmlspecialchars($_POST['message']      ?? '', ENT_QUOTES, 'UTF-8'));

if (empty($prenom) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($message)) {
    http_response_code(400);
    echo 'error:missing_fields';
    exit;
}

// Anti-spam basique
if (strlen($message) < 20 || strlen($message) > 3000) {
    http_response_code(400);
    echo 'error:message_length';
    exit;
}

// Construction du corps du mail
$types = [
    'decouverte'  => 'Séance Découverte – Foot Worship (150€)',
    'domination'  => 'Séance Domination – Femdom / Humiliation (200–250€)',
    'integrale'   => 'Séance Intégrale – Sur mesure (devis)',
];
$typeLabel = $types[$type_seance] ?? 'Non précisé';

$body = "
♛ NOUVELLE DEMANDE DE SÉANCE – Milla Alpha
════════════════════════════════════════

Prénom        : {$prenom}
Email         : {$email}
Type de séance : {$typeLabel}
Disponibilités : " . ($disponibilites ?: 'Non précisées') . "

────────────────────────────────────────
Message :

{$message}

════════════════════════════════════════
Reçu via millaaplha.fr
";

// Envoi avec PHPMailer
$mail = new PHPMailer(true);

try {
    // Serveur
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // Expéditeur et destinataire
    $mail->setFrom(MAIL_FROM, 'Milla Alpha – Formulaire');
    $mail->addAddress(MAIL_TO, 'Milla Alpha');
    $mail->addReplyTo($email, $prenom);

    // Contenu
    $mail->isHTML(false);
    $mail->Subject = "[Milla Alpha ♛] Nouvelle demande – {$prenom} – {$typeLabel}";
    $mail->Body    = $body;

    $mail->send();

    http_response_code(200);
    echo 'success';

} catch (Exception $e) {
    // Log l'erreur sans l'exposer au client
    error_log('[MillaAlpha] Mailer Error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo 'error:mailer';
}
