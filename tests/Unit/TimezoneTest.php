<?php

namespace Tests\Unit;

use Tests\TestCase;

class TimezoneTest extends TestCase
{
    public function test_application_uses_manila_time(): void
    {
        $this->assertSame('Asia/Manila', config('app.timezone'));
        $this->assertSame('Asia/Manila', now()->timezoneName);
    }
}
