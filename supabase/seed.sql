-- Seed data for SmartHotel PMS

-- Insert rooms (12 rooms: mix of standard/deluxe/suite)
INSERT INTO rooms (id, room_number, type, base_price, status, floor, capacity) VALUES
  ('a1000000-0000-0000-0000-000000000001', '101', 'standard', 89.00, 'available', 1, 2),
  ('a1000000-0000-0000-0000-000000000002', '102', 'standard', 89.00, 'available', 1, 2),
  ('a1000000-0000-0000-0000-000000000003', '103', 'standard', 89.00, 'occupied', 1, 2),
  ('a1000000-0000-0000-0000-000000000004', '104', 'standard', 99.00, 'available', 1, 3),
  ('a1000000-0000-0000-0000-000000000005', '201', 'deluxe', 149.00, 'available', 2, 2),
  ('a1000000-0000-0000-0000-000000000006', '202', 'deluxe', 149.00, 'occupied', 2, 2),
  ('a1000000-0000-0000-0000-000000000007', '203', 'deluxe', 159.00, 'available', 2, 3),
  ('a1000000-0000-0000-0000-000000000008', '204', 'deluxe', 159.00, 'maintenance', 2, 2),
  ('a1000000-0000-0000-0000-000000000009', '301', 'suite', 299.00, 'available', 3, 4),
  ('a1000000-0000-0000-0000-000000000010', '302', 'suite', 299.00, 'occupied', 3, 4),
  ('a1000000-0000-0000-0000-000000000011', '303', 'suite', 349.00, 'available', 3, 4),
  ('a1000000-0000-0000-0000-000000000012', '304', 'suite', 399.00, 'available', 3, 6);

-- Insert guests
INSERT INTO guests (id, name, email, phone, nationality, preferences, notes) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'James Wilson', 'james.wilson@example.com', '+1-555-0101', 'American', 'High floor, king bed, late checkout', 'Loyalty member since 2019'),
  ('b2000000-0000-0000-0000-000000000002', 'Sophie Laurent', 'sophie.laurent@example.com', '+33-6-1234-5678', 'French', 'Non-smoking, quiet room, extra pillows', 'VIP guest, prefers champagne on arrival'),
  ('b2000000-0000-0000-0000-000000000003', 'Kenji Tanaka', 'kenji.tanaka@example.com', '+81-90-1234-5678', 'Japanese', 'Twin beds, low floor', 'Business traveler, needs early breakfast'),
  ('b2000000-0000-0000-0000-000000000004', 'Maria Garcia', 'maria.garcia@example.com', '+34-612-345-678', 'Spanish', 'Ocean view if available, king bed', 'Celebrating anniversary'),
  ('b2000000-0000-0000-0000-000000000005', 'Ahmed Hassan', 'ahmed.hassan@example.com', '+971-50-123-4567', 'Emirati', 'Halal meals, prayer mat requested', 'Requires airport transfer');

-- Insert bookings
INSERT INTO bookings (id, guest_id, room_id, check_in, check_out, total_price, payment_status, booking_source, status, special_requests) VALUES
  (
    'c3000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    '2026-03-25',
    '2026-03-29',
    '356.00',
    'paid',
    'direct',
    'checked_in',
    'Extra towels please'
  ),
  (
    'c3000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000006',
    '2026-03-26',
    '2026-03-30',
    '596.00',
    'paid',
    'booking.com',
    'checked_in',
    'Champagne on arrival'
  ),
  (
    'c3000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000010',
    '2026-03-27',
    '2026-03-31',
    '1196.00',
    'paid',
    'direct',
    'checked_in',
    'Early breakfast at 6am'
  ),
  (
    'c3000000-0000-0000-0000-000000000004',
    'b2000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000009',
    '2026-03-28',
    '2026-04-02',
    '1495.00',
    'pending',
    'direct',
    'confirmed',
    'Anniversary decoration in room'
  ),
  (
    'c3000000-0000-0000-0000-000000000005',
    'b2000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000007',
    '2026-03-29',
    '2026-04-03',
    '795.00',
    'pending',
    'airbnb',
    'confirmed',
    'Airport pickup required'
  ),
  (
    'c3000000-0000-0000-0000-000000000006',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000011',
    '2026-02-10',
    '2026-02-14',
    '1396.00',
    'paid',
    'direct',
    'checked_out',
    NULL
  ),
  (
    'c3000000-0000-0000-0000-000000000007',
    'b2000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000005',
    '2026-01-15',
    '2026-01-18',
    '447.00',
    'paid',
    'booking.com',
    'checked_out',
    NULL
  );

-- Insert payments
INSERT INTO payments (booking_id, amount, status, gateway_reference, payment_method) VALUES
  ('c3000000-0000-0000-0000-000000000001', 356.00, 'completed', 'pi_test_001', 'card'),
  ('c3000000-0000-0000-0000-000000000002', 596.00, 'completed', 'pi_test_002', 'card'),
  ('c3000000-0000-0000-0000-000000000003', 1196.00, 'completed', 'pi_test_003', 'card'),
  ('c3000000-0000-0000-0000-000000000006', 1396.00, 'completed', 'pi_test_006', 'card'),
  ('c3000000-0000-0000-0000-000000000007', 447.00, 'completed', 'pi_test_007', 'card');

-- Insert initial housekeeping logs
INSERT INTO housekeeping_logs (room_id, status, updated_by, notes) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'clean', 'Maria S.', 'Ready for guest'),
  ('a1000000-0000-0000-0000-000000000002', 'clean', 'Maria S.', 'Ready for guest'),
  ('a1000000-0000-0000-0000-000000000003', 'dirty', 'System', 'Guest checked in'),
  ('a1000000-0000-0000-0000-000000000004', 'clean', 'John D.', 'Ready for guest'),
  ('a1000000-0000-0000-0000-000000000005', 'clean', 'Maria S.', 'Ready for guest'),
  ('a1000000-0000-0000-0000-000000000006', 'dirty', 'System', 'Guest checked in'),
  ('a1000000-0000-0000-0000-000000000007', 'in_progress', 'John D.', 'Deep cleaning in progress'),
  ('a1000000-0000-0000-0000-000000000008', 'in_progress', 'Sarah K.', 'Maintenance and cleaning'),
  ('a1000000-0000-0000-0000-000000000009', 'clean', 'Sarah K.', 'Ready for guest'),
  ('a1000000-0000-0000-0000-000000000010', 'dirty', 'System', 'Guest checked in'),
  ('a1000000-0000-0000-0000-000000000011', 'clean', 'Maria S.', 'Turndown complete'),
  ('a1000000-0000-0000-0000-000000000012', 'clean', 'John D.', 'Ready for guest');
