<?php

namespace App\Controller;

use App\Entity\Order;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function index(OrderRepository $repository): JsonResponse
    {
        $orders = $repository->findAll();

        $data = array_map(fn(Order $order) => [
            'id' => $order->getId(),
            'customerName' => $order->getCustomerName(),
            'customerEmail' => $order->getCustomerEmail(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $orders);

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(Order $order): JsonResponse
    {
        return $this->json([
            'id' => $order->getId(),
            'customerName' => $order->getCustomerName(),
            'customerEmail' => $order->getCustomerEmail(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['customerName']) || empty($data['customerEmail'])) {
            return $this->json(['error' => 'Customer name and email are required'], Response::HTTP_BAD_REQUEST);
        }

        $order = new Order();
        $order->setCustomerName($data['customerName']);
        $order->setCustomerEmail($data['customerEmail']);
        $order->setStatus($data['status'] ?? 'new');
        $order->setCreatedAt(new \DateTime());

        $em->persist($order);
        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'customerName' => $order->getCustomerName(),
            'customerEmail' => $order->getCustomerEmail(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(Request $request, Order $order, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['customerName'])) {
            $order->setCustomerName($data['customerName']);
        }
        if (isset($data['customerEmail'])) {
            $order->setCustomerEmail($data['customerEmail']);
        }
        if (isset($data['status'])) {
            $order->setStatus($data['status']);
        }

        $em->flush();

        return $this->json([
            'id' => $order->getId(),
            'customerName' => $order->getCustomerName(),
            'customerEmail' => $order->getCustomerEmail(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(Order $order, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($order);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
