<?php

namespace Tests\Unit;

use App\Domain\Tracking\Sources\Mock\MockAircraftAdapter;
use PHPUnit\Framework\TestCase;

final class MockAircraftAdapterTest extends TestCase
{
    public function test_it_emits_twenty_normalized_realistic_aircraft(): void
    {
        $a = new MockAircraftAdapter;
        $items = iterator_to_array($a->retrieveObservations());
        $this->assertCount(20, $items);
        $o = $a->normalize($items[0]);
        $this->assertSame('aircraft', $o->type);
        $this->assertArrayHasKey('icao_hex', $o->externalIdentifiers);
        $this->assertGreaterThan(100, $o->speed);
    }
}
