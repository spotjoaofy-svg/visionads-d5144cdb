#!/usr/bin/env python3
"""
Script de Migração Automática do Banco de Dados Supabase
Migra toda a estrutura do BD para um novo projeto Supabase
"""

import os
import sys
import requests
import json
from pathlib import Path
from typing import Optional, Dict

class SupabaseMigration:
    def __init__(self, project_url: str, service_role_key: str, sql_file_path: str):
        """
        Initialize migration with Supabase credentials
        
        Args:
            project_url: URL do projeto Supabase (ex: https://mxutidghlefnvjgskbbu.supabase.co)
            service_role_key: Service Role Key do Supabase
            sql_file_path: Caminho para o arquivo SQL da migration
        """
        self.project_url = project_url.rstrip('/')
        self.service_role_key = service_role_key
        self.sql_file_path = Path(sql_file_path)
        self.headers = {
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
    def read_sql_file(self) -> str:
        """Read SQL migration file"""
        if not self.sql_file_path.exists():
            raise FileNotFoundError(f"Arquivo SQL não encontrado: {self.sql_file_path}")
        
        with open(self.sql_file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def execute_sql(self, sql_content: str) -> Dict:
        """
        Execute SQL via Supabase REST API
        
        Args:
            sql_content: SQL a ser executado
            
        Returns:
            Response do servidor
        """
        # Quebrar SQL em statements individuais para melhor tratamento de erros
        statements = [
            stmt.strip() 
            for stmt in sql_content.split(';') 
            if stmt.strip()
        ]
        
        print(f"📊 Total de statements a executar: {len(statements)}")
        print("=" * 60)
        
        results = {
            "success": 0,
            "warning": 0,
            "error": 0,
            "errors": []
        }
        
        for i, statement in enumerate(statements, 1):
            if not statement.strip():
                continue
                
            try:
                # Mostrar progresso
                preview = statement[:80].replace('\n', ' ')
                print(f"\n[{i}/{len(statements)}] Executando: {preview}...")
                
                # Executar via PostgreSQL query via RPC
                # Supabase não expõe exec_sql diretamente, então vamos usar SQL Editor via HTTP
                response = self._execute_statement(statement)
                
                if response.get('error'):
                    # Se for erro de "já existe", considerar como warning
                    if 'already exists' in str(response.get('error', '')).lower():
                        print(f"    ⚠️  Warning: Objeto já existe")
                        results["warning"] += 1
                    else:
                        print(f"    ❌ Erro: {response['error']}")
                        results["error"] += 1
                        results["errors"].append({
                            "statement": statement[:100],
                            "error": response['error']
                        })
                else:
                    print(f"    ✅ Sucesso")
                    results["success"] += 1
                    
            except Exception as e:
                print(f"    ❌ Exceção: {str(e)}")
                results["error"] += 1
                results["errors"].append({
                    "statement": statement[:100],
                    "error": str(e)
                })
        
        return results
    
    def _execute_statement(self, statement: str) -> Dict:
        """
        Execute uma statement SQL individual
        
        Nota: Supabase REST API não oferece exec_sql, então usamos uma abordagem alternativa
        """
        try:
            # Tentar via rpc (se disponível)
            url = f"{self.project_url}/rest/v1/rpc/exec_sql"
            
            payload = {
                "sql": statement
            }
            
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return {"success": True}
            else:
                return {
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            # Fallback: retornar erro mas continuar
            return {"error": str(e)}
    
    def verify_tables(self) -> Dict:
        """Verify if tables were created successfully"""
        expected_tables = [
            'profiles',
            'workspaces',
            'workspace_members',
            'ad_accounts',
            'campaigns',
            'daily_metrics',
            'creatives',
            'creative_audits',
            'alerts',
            'alert_rules',
            'ai_chat_messages'
        ]
        
        print("\n\n🔍 Verificando tabelas criadas...")
        print("=" * 60)
        
        # Query para listar tabelas
        url = f"{self.project_url}/rest/v1/information_schema.tables"
        params = {
            "table_schema": "eq.public",
            "select": "table_name"
        }
        
        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                tables = [t['table_name'] for t in response.json()]
                
                for table in expected_tables:
                    if table in tables:
                        print(f"✅ {table}")
                    else:
                        print(f"❌ {table} (não encontrada)")
                
                return {
                    "total_expected": len(expected_tables),
                    "tables_found": len([t for t in expected_tables if t in tables]),
                    "success": len([t for t in expected_tables if t in tables]) == len(expected_tables)
                }
            else:
                print(f"⚠️  Não foi possível verificar: {response.text}")
                return {"success": False}
                
        except Exception as e:
            print(f"⚠️  Erro na verificação: {str(e)}")
            return {"success": False}
    
    def run(self) -> bool:
        """Execute the full migration"""
        print("\n🚀 INICIANDO MIGRAÇÃO DO BANCO DE DADOS")
        print("=" * 60)
        print(f"📍 Projeto de destino: {self.project_url}")
        print(f"📄 Arquivo SQL: {self.sql_file_path}")
        print("=" * 60)
        
        try:
            # Step 1: Read SQL
            print("\n📖 Lendo arquivo SQL...")
            sql_content = self.read_sql_file()
            print(f"✅ {len(sql_content)} caracteres lidos")
            
            # Step 2: Execute SQL
            print("\n⚙️  Executando SQL...")
            results = self.execute_sql(sql_content)
            
            # Summary
            print("\n\n📊 RESUMO DA EXECUÇÃO")
            print("=" * 60)
            print(f"✅ Sucesso: {results['success']}")
            print(f"⚠️  Avisos: {results['warning']}")
            print(f"❌ Erros: {results['error']}")
            
            if results['errors']:
                print("\n🔴 Erros encontrados:")
                for err in results['errors'][:5]:  # Mostrar apenas os primeiros 5
                    print(f"  - {err['error']}")
            
            # Step 3: Verify
            verification = self.verify_tables()
            
            success = results['error'] == 0 and verification.get('success', False)
            
            print("\n\n✨ PRÓXIMOS PASSOS")
            print("=" * 60)
            if success:
                print("1. ✅ Banco de dados migrado com sucesso!")
                print("2. 📝 Atualize as credenciais no arquivo .env")
                print("3. 🔄 Reinicie o servidor de desenvolvimento")
                print("4. 🧪 Teste o login")
            else:
                print("1. ⚠️  Verifique os erros acima")
                print("2. 🔗 Acesse o SQL Editor do Supabase Dashboard para debug")
                print("3. 📞 Copie o erro e procure documentação")
            
            return success
            
        except Exception as e:
            print(f"\n❌ Erro fatal: {str(e)}")
            return False


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Migre o banco de dados do Supabase para um novo projeto'
    )
    
    parser.add_argument(
        '--url',
        help='URL do novo projeto Supabase (ex: https://mxutidghlefnvjgskbbu.supabase.co)',
        required=False
    )
    
    parser.add_argument(
        '--key',
        help='Service Role Key do novo projeto Supabase',
        required=False
    )
    
    parser.add_argument(
        '--sql',
        help='Caminho para o arquivo SQL',
        default='supabase/migrations/20260321165728_f84749fb-30b6-41a2-a264-8c7a4f10fcdb.sql'
    )
    
    args = parser.parse_args()
    
    # Get from environment or arguments
    project_url = args.url or os.getenv('SUPABASE_URL')
    service_role_key = args.key or os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    # Interactive mode if not provided
    if not project_url:
        project_url = input("🔗 Digite a URL do novo projeto Supabase: ").strip()
    
    if not service_role_key:
        service_role_key = input("🔑 Digite a Service Role Key: ").strip()
    
    # Validate inputs
    if not project_url or not service_role_key:
        print("❌ URL e Service Role Key são obrigatórias")
        sys.exit(1)
    
    # Run migration
    migration = SupabaseMigration(project_url, service_role_key, args.sql)
    success = migration.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
