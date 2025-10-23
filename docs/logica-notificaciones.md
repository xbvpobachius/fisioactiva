# 📋 Lògica de Notificacions - Clients Nous

## 🎯 Com Funciona

La app de calendari (Fisioactiva) **només envia notificacions** quan es crea una cita per a un **client NOU** que encara **no té fitxa** creada a l'app de fichas (Fisiodbfiches).

## 🔍 Condicions per Enviar Notificació

La notificació s'envia SI i NOMÉS SI:

```javascript
client.isFirstTime === true
   O
isFirstTimeAppointment === true
```

### ✅ Quan S'ENVIA notificació:

1. **Client completament nou**: Primera vegada a la clínica
   - `client.isFirstTime = true`
   - 🔔 Envia notificació → Fisioterapeuta ha de crear fitxa

2. **Primera cita d'un client**: Client existent però primera cita
   - `isFirstTimeAppointment = true`
   - 🔔 Envia notificació → Fisioterapeuta ha de crear fitxa

### ❌ Quan NO s'envia notificació:

1. **Client amb fitxa existent**: Ja té la seva fitxa creada
   - `client.isFirstTime = false`
   - `isFirstTimeAppointment = false`
   - ℹ️ No cal notificació → Fitxa ja existeix

2. **Segona, tercera, etc. cita**: Client recurrent
   - ℹ️ No cal notificació → Fitxa ja creada

## 📊 Exemples

### Exemple 1: Client Nou ✅
```
Situació: Maria Garcia ve per primera vegada
- client.isFirstTime = true
- isFirstTimeAppointment = true
- Resultat: 🔔 Envia notificació
```

### Exemple 2: Client Existent ❌
```
Situació: Joan Martínez ja té fitxa i ve per 3a cita
- client.isFirstTime = false
- isFirstTimeAppointment = false
- Resultat: ℹ️ No envia notificació
```

### Exemple 3: Client Reactivat ✅
```
Situació: Client antic que torna després de temps
- client.isFirstTime = false
- isFirstTimeAppointment = true
- Resultat: 🔔 Envia notificació (per si cal actualitzar fitxa)
```

## 🔧 Com es Configura en els Clients

Quan crees o importes un client a Fisioactiva, has de configurar:

### A la Base de Dades (Supabase - clients):

```sql
-- Client NOU (primera vegada)
INSERT INTO clients (name, is_first_time) 
VALUES ('Maria Garcia', true);

-- Client EXISTENT (ja té fitxa)
INSERT INTO clients (name, is_first_time) 
VALUES ('Joan Martínez', false);
```

### Al Crear la Cita:

```typescript
// Cita per client nou
{
  client: { id: '...', name: 'Maria Garcia', isFirstTime: true },
  isFirstTimeAppointment: true,
  // ... altres camps
}

// Cita per client existent
{
  client: { id: '...', name: 'Joan Martínez', isFirstTime: false },
  isFirstTimeAppointment: false,
  // ... altres camps
}
```

## 📋 Logs als Railway

Quan crees una cita, veuràs als logs:

### Per Client NOU:
```
📅 [APPOINTMENT] Appointment created successfully
📅 [APPOINTMENT] Client name: Maria Garcia
📅 [APPOINTMENT] Client isFirstTime: true
📅 [APPOINTMENT] isFirstTimeAppointment: true
🆕 [APPOINTMENT] New client detected, sending notification...
🔔 [NOTIFICATION] Starting notification process...
✅ [NOTIFICATION] Notification sent successfully!
✅ [APPOINTMENT] Notification sent successfully for new client
```

### Per Client EXISTENT:
```
📅 [APPOINTMENT] Appointment created successfully
📅 [APPOINTMENT] Client name: Joan Martínez
📅 [APPOINTMENT] Client isFirstTime: false
📅 [APPOINTMENT] isFirstTimeAppointment: false
ℹ️ [APPOINTMENT] Existing client - no notification needed
```

## 🔄 Flux Complet

```
1. Usuari crea cita a Fisioactiva
         ↓
2. Sistema comprova: és client nou?
         ↓
    ┌────┴────┐
    ↓         ↓
  SI (nou)   NO (existent)
    ↓         ↓
    🔔        ℹ️
    ↓         ↓
3. Envia     No envia
   notif.    notif.
    ↓
4. Notificació apareix a Fisiodbfiches
    ↓
5. Fisioterapeuta crea fitxa
    ↓
6. Marca com completada
```

## ⚙️ Configuració Recomanada

### Quan Importes Clients de Fitxes Existents:

Si ja tens fitxes creades i importes els clients:

```sql
-- Marca'ls com NO nous (ja tenen fitxa)
UPDATE clients SET is_first_time = false 
WHERE id IN (SELECT DISTINCT client_id FROM clients_records);
```

### Quan Afegeixes Client Nou:

```typescript
// A la UI de Fisioactiva
const newClient = {
  name: 'Maria Garcia',
  isFirstTime: true,  // ← Important!
  // ... altres camps
};
```

## 🎯 Beneficis

1. **Evita notificacions innecessàries**: No molesta amb notificacions per clients que ja tenen fitxa
2. **Enfoca l'atenció**: Només notifica quan realment cal crear una fitxa
3. **Manté l'ordre**: Només una notificació per client nou
4. **Escalable**: Funciona amb milers de clients sense saturar

## 📝 Notes Importants

- **isFirstTime** es guarda a la base de dades (persistent)
- **isFirstTimeAppointment** es marca al crear cada cita
- Si dubtes → millor enviar notificació (més val sobrar que faltar)
- Pots canviar manualment `is_first_time` a Supabase si cal

## ✅ Checklist

Quan configures un nou entorn:

- [ ] Taula `clients` té columna `is_first_time` (boolean)
- [ ] Clients nous es creen amb `is_first_time = true`
- [ ] Clients existents amb fitxa tenen `is_first_time = false`
- [ ] Al crear cita, es passa correctament `isFirstTimeAppointment`
- [ ] Logs mostren "New client detected" només per clients nous
- [ ] Notificacions només apareixen per clients nous

---

**Resultat Final:** Sistema eficient que només notifica quan és necessari crear una fitxa nova! 🎉

