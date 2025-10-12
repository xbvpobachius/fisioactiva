"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSupabase() {
  const [status, setStatus] = useState<string>("Testing...")
  const [results, setResults] = useState<any[]>([])

  const testConnection = async () => {
    setStatus("🔄 Probando conexión...")
    const tests: any[] = []

    // Test 1: Verificar configuración
    tests.push({
      name: "Configuración",
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌",
      details: process.env.NEXT_PUBLIC_SUPABASE_URL || "URL no configurada"
    })

    // Test 2: Probar conexión básica
    try {
      const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true })
      tests.push({
        name: "Tabla clients",
        status: error ? "❌" : "✅",
        details: error ? JSON.stringify(error) : "Tabla existe"
      })
    } catch (e: any) {
      tests.push({
        name: "Tabla clients",
        status: "❌",
        details: e.message
      })
    }

    // Test 3: Probar tabla appointments
    try {
      const { data, error } = await supabase.from('appointments').select('count', { count: 'exact', head: true })
      tests.push({
        name: "Tabla appointments",
        status: error ? "❌" : "✅",
        details: error ? JSON.stringify(error) : "Tabla existe"
      })
    } catch (e: any) {
      tests.push({
        name: "Tabla appointments",
        status: "❌",
        details: e.message
      })
    }

    // Test 4: Intentar insertar un cliente de prueba
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: 'Test Client',
          is_first_time: true,
          consents: {}
        }])
        .select()

      tests.push({
        name: "Insertar cliente",
        status: error ? "❌" : "✅",
        details: error ? JSON.stringify(error) : "Cliente insertado correctamente"
      })

      // Si se insertó, eliminarlo
      if (data && data[0]) {
        await supabase.from('clients').delete().eq('id', data[0].id)
      }
    } catch (e: any) {
      tests.push({
        name: "Insertar cliente",
        status: "❌",
        details: e.message
      })
    }

    setResults(tests)
    const allPassed = tests.every(t => t.status === "✅")
    setStatus(allPassed ? "✅ Todo funciona correctamente" : "❌ Hay problemas de configuración")
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnóstico de Supabase</CardTitle>
          <p className="text-lg font-semibold">{status}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.name}</span>
                  <span className="text-2xl">{result.status}</span>
                </div>
                <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          <Button onClick={testConnection} className="mt-6 w-full">
            Volver a probar
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Si ves errores:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ve a Supabase → SQL Editor</li>
              <li>Ejecuta el archivo <code className="bg-white px-1 rounded">supabase_schema.sql</code></li>
              <li>Verifica que las tablas se crearon en Table Editor</li>
              <li>Recarga esta página</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
