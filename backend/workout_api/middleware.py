from django.http import HttpResponseForbidden
from django.shortcuts import redirect


class AdminAccessMiddleware:
    """Restrict admin access to specific email only"""
    
    ALLOWED_EMAIL = 'ayedik02@gmail.com'
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if accessing admin
        if request.path.startswith('/admin/'):
            # Allow login page and static files
            if (request.path == '/admin/' or 
                request.path == '/admin/login/' or 
                'jsi18n' in request.path or
                '/admin/static/' in request.path or
                request.path.startswith('/admin/jsi18n/')):
                return self.get_response(request)
            
            # Check if user is authenticated
            if request.user.is_authenticated:
                # Only allow if user has the specific email
                if request.user.email != self.ALLOWED_EMAIL:
                    return HttpResponseForbidden(
                        '<html><body style="font-family: sans-serif; padding: 50px; text-align: center;">'
                        '<h1 style="color: #dc2626;">Access Denied</h1>'
                        '<p style="color: #6b7280; font-size: 18px;">You do not have permission to access the admin panel.</p>'
                        '<p style="color: #9ca3af;">Only authorized administrators can access this area.</p>'
                        '</body></html>'
                    )
            
        response = self.get_response(request)
        return response
