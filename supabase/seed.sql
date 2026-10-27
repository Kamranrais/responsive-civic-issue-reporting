-- ═══════════════════════════════════════════════════════════
-- JanSight Sample Data — Run AFTER schema.sql
-- ═══════════════════════════════════════════════════════════
-- Note: Replace user UUIDs with real auth.users IDs from your Supabase project.

-- First, ensure a demo admin user exists (run in Supabase Auth → Users)
-- Then promote them: UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';

INSERT INTO reports (
  complaint_id, user_id, title, description, category, severity, status,
  lat, lng, address, ai_analysis, department, assigned_to, created_at, resolved_at
) VALUES
(
  'JS-2024-100001',
  '00000000-0000-0000-0000-000000000001', -- Replace with real user UUID
  'Large pothole near Connaught Place',
  'Deep pothole causing danger to vehicles near CP roundabout. Multiple vehicles damaged.',
  'pothole', 'high', 'in_progress',
  28.6315, 77.2167,
  'Connaught Place, New Delhi, Delhi 110001',
  '{"category": "pothole", "severity": "high", "confidence": 0.91, "description": "Large road surface damage visible"}',
  'PWD (Public Works Department)', 'North Delhi PWD Division',
  NOW() - INTERVAL '5 days', NULL
),
(
  'JS-2024-100002',
  '00000000-0000-0000-0000-000000000001',
  'Overflowing garbage bins at Dadar Market',
  'Bins overflowing for 3 days, attracting flies and creating health hazard.',
  'garbage', 'medium', 'assigned',
  19.0760, 72.8777,
  'Dadar Market, Mumbai, Maharashtra 400014',
  '{"category": "garbage", "severity": "medium", "confidence": 0.88, "description": "Waste overflow at collection point"}',
  'Sanitation Department', 'Zone 4 Sanitation Team',
  NOW() - INTERVAL '3 days', NULL
),
(
  'JS-2024-100003',
  '00000000-0000-0000-0000-000000000001',
  'Street lights non-functional on MG Road',
  'Three consecutive streetlights broken, creating safety hazard at night.',
  'streetlight', 'high', 'submitted',
  12.9716, 77.5946,
  'MG Road, Bengaluru, Karnataka 560001',
  '{"category": "streetlight", "severity": "high", "confidence": 0.94, "description": "Multiple non-functional streetlights"}',
  NULL, NULL,
  NOW() - INTERVAL '1 day', NULL
),
(
  'JS-2024-100004',
  '00000000-0000-0000-0000-000000000001',
  'Severe waterlogging after rain at Park Street',
  'Knee-deep water, vehicles stuck, mosquito breeding risk.',
  'waterlogging', 'critical', 'under_review',
  22.5726, 88.3639,
  'Park Street, Kolkata, West Bengal 700016',
  '{"category": "waterlogging", "severity": "critical", "confidence": 0.96, "description": "Critical flood-level waterlogging"}',
  NULL, NULL,
  NOW() - INTERVAL '6 hours', NULL
),
(
  'JS-2024-100005',
  '00000000-0000-0000-0000-000000000001',
  'Broken footpath tiles near Banjara Hills',
  'Pavement tiles broken and uplifted, tripping hazard for elderly pedestrians.',
  'infrastructure', 'medium', 'resolved',
  17.3850, 78.4867,
  'Banjara Hills Road 12, Hyderabad, Telangana 500034',
  '{"category": "infrastructure", "severity": "medium", "confidence": 0.82, "description": "Damaged pavement infrastructure"}',
  'GHMC', 'Road Maintenance Cell',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '1 day'
);
