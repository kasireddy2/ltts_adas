# Copyright (C) 2018 Intel Corporation
#
# SPDX-License-Identifier: MIT

from rest_framework import views
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_auth.registration.views import RegisterView
from allauth.account import app_settings as allauth_settings
from furl import furl
from rest_framework import status
from django.utils.translation import ugettext_lazy as _

# from allauth.account.models import EmailAddress
from . import signature
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_auth.registration.views import SocialLoginView
from django.conf import settings
#from django.core.mail import send_mail


# import smtplib, ssl

# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText

# from cvat.settings.development import EMAIL_HOST_USER, EMAIL_HOST_PASSWORD 



@method_decorator(name='post', decorator=swagger_auto_schema(
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=[
            'url'
        ],
        properties={
            'url': openapi.Schema(type=openapi.TYPE_STRING)
        }
    ),
    responses={'200': openapi.Response(description='text URL')}
))
class SigningView(views.APIView):
    """
    This method signs URL for access to the server.

    Signed URL contains a token which authenticates a user on the server.
    Signed URL is valid during 30 seconds since signing.
    """
    def post(self, request):
        url = request.data.get('url')
        if not url:
            raise ValidationError('Please provide `url` parameter')

        signer = signature.Signer()
        url = self.request.build_absolute_uri(url)
        sign = signer.sign(self.request.user, url)

        url = furl(url).add({signature.QUERY_PARAM: sign}).url
        return Response(url)

class GoogleLogin(SocialLoginView):
    print("Signing in")
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter


"""this class extended for adding email verified required by Savita and KalaiSelvi"""    
class RegisterViewEx(RegisterView):
    def get_response_data(self, user):
        data = self.get_serializer(user).data
        data['email_verification_required'] = allauth_settings.EMAIL_VERIFICATION == \
            allauth_settings.EmailVerificationMethod.MANDATORY

        return data
