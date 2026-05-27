import requests
import sys
from datetime import datetime, date, timedelta
import json

class SalaReserveAPITester:
    def __init__(self, base_url="https://sala-reserve-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_booking_id = None
        
    def run_test(self, name, method, endpoint, expected_status, data=None, expected_fields=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
                
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Check if response contains expected fields
                if expected_fields and response.content:
                    try:
                        response_data = response.json()
                        for field in expected_fields:
                            if field not in str(response_data):
                                print(f"   ⚠️  Warning: Expected field '{field}' not found in response")
                            else:
                                print(f"   ✓ Found expected field: {field}")
                    except Exception as e:
                        print(f"   ⚠️  Could not parse response JSON: {e}")
                
                return True, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_detail = response.json()
                        print(f"   Error: {error_detail}")
                    except:
                        print(f"   Error response: {response.text}")
                return False, {}
                
        except Exception as e:
            print(f"❌ Failed - Exception: {str(e)}")
            return False, {}
    
    def test_health_check(self):
        """Test basic API health"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200,
            expected_fields=["message"]
        )
        return success
    
    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@sistema.com", "senha": "admin123"},
            expected_fields=["access_token", "user"]
        )
        
        if success:
            self.token = response.get('access_token')
            self.user_data = response.get('user')
            print(f"   ✓ Token received and user: {self.user_data.get('nome', 'Unknown')}")
            return True
        return False
    
    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET", 
            "auth/me",
            200,
            expected_fields=["nome", "email", "perfil"]
        )
        
        if success and response:
            print(f"   ✓ User: {response.get('nome')} - Role: {response.get('perfil')}")
        return success
    
    def test_list_rooms(self):
        """Test listing rooms - should have 4 example rooms"""
        success, response = self.run_test(
            "List Rooms",
            "GET",
            "rooms",
            200,
            expected_fields=["nome", "localizacao", "capacidade"]
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} rooms")
            if len(response) >= 4:
                print(f"   ✓ Expected 4+ rooms present")
                for room in response[:2]:  # Show first 2 rooms
                    print(f"     - {room.get('nome')} ({room.get('capacidade')} pessoas)")
            else:
                print(f"   ⚠️  Expected at least 4 rooms, found {len(response)}")
            return True
        return success
    
    def test_create_room(self):
        """Test creating a new room (admin only)"""
        room_data = {
            "nome": f"Sala Teste API {datetime.now().strftime('%H%M%S')}",
            "localizacao": "Test Floor - API",
            "capacidade": 8
        }
        
        success, response = self.run_test(
            "Create Room",
            "POST",
            "rooms",
            200,  # Expecting 200 based on backend code
            data=room_data,
            expected_fields=["id", "nome", "localizacao", "capacidade"]
        )
        
        if success:
            print(f"   ✓ Room created with ID: {response.get('id')}")
        return success
    
    def test_create_booking(self):
        """Test creating a booking for available room"""
        # Get rooms first
        rooms_success, rooms_response = self.run_test(
            "Get Rooms for Booking",
            "GET",
            "rooms",
            200
        )
        
        if not rooms_success or not rooms_response:
            print("   ❌ Cannot create booking - no rooms available")
            return False
        
        # Use first room
        room = rooms_response[0]
        tomorrow = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        booking_data = {
            "room_id": room['id'],
            "data": tomorrow,
            "hora_inicio": "10:00",
            "hora_fim": "11:00"
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,  # Expecting 200 based on backend code
            data=booking_data,
            expected_fields=["id", "room_id", "user_id", "data"]
        )
        
        if success:
            self.created_booking_id = response.get('id')
            print(f"   ✓ Booking created with ID: {self.created_booking_id}")
            print(f"   ✓ Room: {room['nome']} on {tomorrow} 10:00-11:00")
        return success
    
    def test_list_my_bookings(self):
        """Test listing user's bookings"""
        success, response = self.run_test(
            "List My Bookings",
            "GET",
            "bookings/my",
            200,
            expected_fields=["room_name", "data", "hora_inicio"]
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} personal bookings")
            if self.created_booking_id and len(response) > 0:
                found_booking = any(b.get('id') == self.created_booking_id for b in response)
                if found_booking:
                    print(f"   ✓ Created booking found in my bookings")
                else:
                    print(f"   ⚠️  Created booking not found in my bookings")
        return success
    
    def test_list_all_bookings(self):
        """Test listing all bookings"""
        success, response = self.run_test(
            "List All Bookings",
            "GET",
            "bookings",
            200,
            expected_fields=["room_name", "user_name", "data"]
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} total bookings")
        return success
    
    def test_cancel_booking(self):
        """Test canceling the created booking"""
        if not self.created_booking_id:
            print("   ⚠️  No booking ID to cancel - skipping test")
            return True
        
        success, response = self.run_test(
            "Cancel Booking",
            "DELETE",
            f"bookings/{self.created_booking_id}",
            200,
            expected_fields=["message"]
        )
        
        if success:
            print(f"   ✓ Booking {self.created_booking_id} cancelled successfully")
        return success
    
    def test_list_users(self):
        """Test listing users (admin only)"""
        success, response = self.run_test(
            "List Users",
            "GET",
            "users",
            200,
            expected_fields=["nome", "email", "departamento", "perfil"]
        )
        
        if success and isinstance(response, list):
            print(f"   ✓ Found {len(response)} users")
            admin_count = sum(1 for u in response if u.get('perfil') == 'admin')
            user_count = len(response) - admin_count
            print(f"   ✓ Admins: {admin_count}, Regular users: {user_count}")
        return success
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "senha": "wrongpassword"}
        )
        # For this test, success means getting the expected 401 status
        return success
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access",
            "GET",
            "users",
            403  # Expecting 403 Forbidden without token
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🚀 Starting API Tests for Sistema de Agendamento de Salas")
    print("=" * 60)
    
    tester = SalaReserveAPITester()
    
    # Run comprehensive test suite
    test_results = []
    
    # Basic connectivity and health
    test_results.append(("API Health", tester.test_health_check()))
    
    # Authentication tests
    test_results.append(("Admin Login", tester.test_admin_login()))
    
    if tester.token:
        test_results.append(("Get Current User", tester.test_get_current_user()))
        test_results.append(("List Rooms", tester.test_list_rooms()))
        
        # Room management (admin functionality)
        test_results.append(("Create Room", tester.test_create_room()))
        
        # Booking workflow
        test_results.append(("Create Booking", tester.test_create_booking()))
        test_results.append(("List My Bookings", tester.test_list_my_bookings()))
        test_results.append(("List All Bookings", tester.test_list_all_bookings()))
        test_results.append(("Cancel Booking", tester.test_cancel_booking()))
        
        # User management (admin functionality)
        test_results.append(("List Users", tester.test_list_users()))
    
    # Security tests
    test_results.append(("Invalid Login", tester.test_invalid_credentials()))
    test_results.append(("Unauthorized Access", tester.test_unauthorized_access()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = []
    failed_tests = []
    
    for test_name, result in test_results:
        if result:
            passed_tests.append(test_name)
            print(f"✅ {test_name}")
        else:
            failed_tests.append(test_name)
            print(f"❌ {test_name}")
    
    print(f"\n📈 Results: {len(passed_tests)}/{len(test_results)} tests passed")
    
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test}")
        return 1
    
    print("\n🎉 All tests passed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())