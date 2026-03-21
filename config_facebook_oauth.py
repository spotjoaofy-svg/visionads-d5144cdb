#!/usr/bin/env python3
"""
Script de Configuração Automática do Facebook OAuth no Supabase
Configura o provider Facebook com as credenciais fornecidas
"""

import os
import sys
import json
import requests
from typing import Dict, Optional

class SupabaseFacebookConfig:
    def __init__(self, project_url: str, service_role_key: str):
        """
        Initialize Supabase Facebook configuration
        
        Args:
            project_url: URL do projeto Supabase
            service_role_key: Service Role Key para operações de admin
        """
        self.project_url = project_url.rstrip('/')
        self.service_role_key = service_role_key
        self.headers = {
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def extract_project_ref(self) -> str:
        """Extract project reference from URL"""
        # https://mxutidghlefnvjgskbbu.supabase.co -> mxutidghlefnvjgskbbu
        return self.project_url.split("://")[1].split(".")[0]
    
    def get_auth_providers(self) -> Dict:
        """Get current auth providers configuration"""
        project_ref = self.extract_project_ref()
        url = f"https://api.supabase.com/v1/projects/{project_ref}/auth/config"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Erro ao buscar configuração: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Exceção: {str(e)}")
            return None
    
    def update_facebook_provider(self, app_id: str, app_secret: str) -> bool:
        """
        Update Facebook provider configuration
        
        Args:
            app_id: Facebook App ID
            app_secret: Facebook App Secret
        
        Returns:
            True if successful, False otherwise
        """
        project_ref = self.extract_project_ref()
        url = f"https://api.supabase.com/v1/projects/{project_ref}/auth/config"
        
        # Payload para habilitar Facebook OAuth
        payload = {
            "external": {
                "facebook": {
                    "enabled": True,
                    "client_id": app_id,
                    "secret": app_secret
                }
            }
        }
        
        print("\n🔄 Enviando configuração para Supabase...")
        print(f"   App ID: {app_id}")
        print(f"   App Secret: {'●' * 10}...")
        
        try:
            response = requests.patch(
                url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                print("\n✅ Configuração do Facebook OAuth aplicada com sucesso!")
                return True
            else:
                print(f"\n❌ Erro na configuração: HTTP {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
                
        except Exception as e:
            print(f"\n❌ Exceção ao configurar: {str(e)}")
            return False
    
    def get_redirect_uri(self) -> str:
        """Get the OAuth redirect URI for Facebook"""
        return f"{self.project_url}/auth/v1/callback?provider=facebook"
    
    def verify_configuration(self) -> bool:
        """Verify if Facebook configuration is active"""
        config = self.get_auth_providers()
        if not config:
            return False
        
        try:
            facebook_config = config.get('external', {}).get('facebook', {})
            if facebook_config.get('enabled'):
                print("\n✅ Facebook OAuth está ATIVO no Supabase")
                return True
            else:
                print("\n❌ Facebook OAuth ainda não está ativo")
                return False
        except Exception as e:
            print(f"❌ Erro ao verificar: {str(e)}")
            return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Configure Facebook OAuth no Supabase'
    )
    
    parser.add_argument(
        '--url',
        help='URL do projeto Supabase',
        default='https://mxutidghlefnvjgskbbu.supabase.co'
    )
    
    parser.add_argument(
        '--key',
        help='Service Role Key do Supabase',
        required=False
    )
    
    parser.add_argument(
        '--app-id',
        help='Facebook App ID',
        default='773214428548471'
    )
    
    parser.add_argument(
        '--app-secret',
        help='Facebook App Secret',
        default='cef279e2788b354f8fca7be6774b7e40'
    )
    
    args = parser.parse_args()
    
    # Get Service Role Key
    service_role_key = args.key or os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not service_role_key:
        print("\n📍 Para obter a Service Role Key:")
        print("   1. Vá para https://app.supabase.com")
        print("   2. Selecione seu projeto")
        print("   3. Settings → API → service_role secret")
        print("   4. Copie e cole aqui")
        service_role_key = input("\n🔑 Cole a Service Role Key: ").strip()
    
    if not service_role_key:
        print("❌ Service Role Key é obrigatória")
        sys.exit(1)
    
    print("\n🚀 CONFIGURANDO FACEBOOK OAUTH NO SUPABASE")
    print("=" * 60)
    print(f"📍 Projeto: {args.url}")
    print(f"🔵 App ID: {args.app_id}")
    print(f"🔐 App Secret: {'●' * 15}...")
    print("=" * 60)
    
    # Initialize configurator
    config = SupabaseFacebookConfig(args.url, service_role_key)
    
    # Get redirect URI
    redirect_uri = config.get_redirect_uri()
    print(f"\n📌 Redirect URI para configurar no Facebook:")
    print(f"   {redirect_uri}")
    print(f"\n   (Copie esse URL para Settings → Facebook Login no Facebook Developers)")
    
    # Update configuration
    success = config.update_facebook_provider(args.app_id, args.app_secret)
    
    if success:
        # Verify
        print("\n🔍 Verificando configuração...")
        if config.verify_configuration():
            print("\n" + "=" * 60)
            print("✨ SUCESSO! Facebook OAuth configurado!")
            print("=" * 60)
            print("\n📝 Próximas ações:")
            print("1. ✅ Configuração no Supabase - CONCLUÍDA")
            print("2. ⏳ Configurar Redirect URI no Facebook Developers")
            print("   - Vá para https://developers.facebook.com")
            print(f"   - Copie esta URL nas configurações: {redirect_uri}")
            print("3. ⏳ Testar login em http://localhost:5173/login")
            print("\n🎉 Bom sorte!")
        else:
            print("\n⚠️  Configuração pode ter falhado. Verifique no dashboard.")
    else:
        print("\n❌ Erro ao configurar. Tente novamente ou use o dashboard.")
        print("\nAlternativa: Configure manualmente em")
        print("https://app.supabase.com → Authentication → Providers → Facebook")
        sys.exit(1)


if __name__ == "__main__":
    main()
