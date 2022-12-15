SELECT city, COUNT(reservations.*) AS total_reservations
FROM properties
LEFT JOIN reservations ON properties.id = reservations.property_id
GROUP BY properties.city
ORDER BY total_reservations DESC
