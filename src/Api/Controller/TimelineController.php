<?php

namespace App\Api\Controller;

use App\Repository\EventRepository;
use App\Repository\RoomRepository;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class TimelineController extends AbstractFOSRestController
{

    /** @Rest\Get("/timeline/items") */
    public function TimelineItemsAction(Request $request, EventRepository $eventRepository): JsonResponse
    {
        $events = $eventRepository->findAll();
        $results = [];

        foreach ($events as $event) {
            $rooms = $event->getRooms();
            foreach ($rooms as $room) {
                $results[] = [
                    'id'      => $event->getId().$room->getId(),
                    'group'   => $room->getId(),
                    'start'   => $event->getCheckIn(),
                    'end'     => $event->getCheckOut(),
                    'content' => $event->getFirstName().' '.$event->getLastName().' | status: '.$event->getStatus(),
                ];
            }
        }

        return $this->json($results);
    }

    /** @Rest\Get("/timeline/groups") */
    public function TimelineGroupsAction(Request $request, RoomRepository $roomRepository): JsonResponse
    {
        $rooms   = $roomRepository->findAll();
        $results = [];

        foreach ($rooms as $room) {
            $results[] = [
                'id'      => $room->getId(),
                'content' => $room->getName(),
            ];
        }

        return $this->json($results);
    }
}
