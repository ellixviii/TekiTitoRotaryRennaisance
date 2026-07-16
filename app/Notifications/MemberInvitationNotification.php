<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MemberInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $url) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Rotary Renaissance invitation')
            ->greeting('You are invited')
            ->line('An administrator invited you to the Rotary Renaissance organization system.')
            ->action('Accept invitation', $this->url)
            ->line('This private link expires in 72 hours and can be used only once.');
    }
}
