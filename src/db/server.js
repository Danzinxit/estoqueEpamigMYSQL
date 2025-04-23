import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuração CORS para permitir requisições do frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://estoqueainf.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000'], // URLs de desenvolvimento
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'dan',
  database: process.env.DB_NAME || 'inventory',
});

// Conectar ao banco
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL');
  }
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro no servidor' });
    if (results.length === 0) return res.status(401).json({ message: 'Usuário não encontrado' });

    const user = results[0];
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Erro no servidor' });
      if (!isMatch) return res.status(401).json({ message: 'Senha incorreta' });

      res.json({
        message: 'Login bem-sucedido',
        user: { id: user.id, name: user.name, role: user.role },
      });
    });
  });
});

// Rota de registro
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'Nome, email e senha são obrigatórios',
      error: 'MISSING_REQUIRED_FIELDS'
    });
  }

  try {
    // Verificar se o email já existe
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Erro ao verificar email:', err);
        return res.status(500).json({ 
          message: 'Erro ao verificar email',
          error: 'DATABASE_ERROR'
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          message: 'Email já está em uso',
          error: 'EMAIL_IN_USE'
        });
      }

      // Se o email não existe, prossegue com o registro
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      db.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, password_hash, role || 'user'],
        (err, result) => {
          if (err) {
            console.error('Erro ao registrar usuário:', err);
            return res.status(500).json({ 
              message: 'Erro ao registrar usuário',
              error: 'REGISTRATION_ERROR'
            });
          }
          
          res.status(201).json({ 
            message: 'Usuário registrado com sucesso',
            userId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao criar usuário',
      error: 'SERVER_ERROR'
    });
  }
});

// Rota para listar usuários
app.get('/api/users', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar usuários' });
    res.json(results);
  });
});

// Rota para atualizar usuário
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  
  // Validações básicas
  if (!name || !email) {
    return res.status(400).json({ 
      message: 'Nome e email são obrigatórios',
      error: 'MISSING_REQUIRED_FIELDS'
    });
  }
  
  try {
    // Verificar se o usuário existe
    db.query('SELECT id FROM users WHERE id = ?', [id], async (err, results) => {
      if (err) {
        console.error('Erro ao verificar usuário:', err);
        return res.status(500).json({ 
          message: 'Erro ao verificar usuário',
          error: 'DATABASE_ERROR'
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ 
          message: 'Usuário não encontrado',
          error: 'USER_NOT_FOUND'
        });
      }
      
      // Verificar se o email já está em uso por outro usuário
      db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], async (err, results) => {
        if (err) {
          console.error('Erro ao verificar email:', err);
          return res.status(500).json({ 
            message: 'Erro ao verificar email',
            error: 'DATABASE_ERROR'
          });
        }
        
        if (results.length > 0) {
          return res.status(400).json({ 
            message: 'Email já está em uso por outro usuário',
            error: 'EMAIL_IN_USE'
          });
        }
        
        // Se a senha foi fornecida, atualizar com a nova senha
        if (password && password.trim() !== '') {
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(password, salt);
          
          db.query(
            'UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?',
            [name, email, password_hash, role, id],
            (err) => {
              if (err) {
                console.error('Erro ao atualizar usuário:', err);
                return res.status(500).json({ 
                  message: 'Erro ao atualizar usuário',
                  error: 'UPDATE_ERROR'
                });
              }
              
              res.json({ 
                message: 'Usuário atualizado com sucesso',
                userId: id
              });
            }
          );
        } else {
          // Se a senha não foi fornecida, manter a senha atual
          db.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [name, email, role, id],
            (err) => {
              if (err) {
                console.error('Erro ao atualizar usuário:', err);
                return res.status(500).json({ 
                  message: 'Erro ao atualizar usuário',
                  error: 'UPDATE_ERROR'
                });
              }
              
              res.json({ 
                message: 'Usuário atualizado com sucesso',
                userId: id
              });
            }
          );
        }
      });
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar usuário',
      error: 'SERVER_ERROR'
    });
  }
});

// Rota para deletar usuário
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Verificar se o usuário existe
  db.query('SELECT id FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).json({ 
        message: 'Erro ao verificar usuário',
        error: 'DATABASE_ERROR'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'Usuário não encontrado',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // Deletar o usuário
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Erro ao deletar usuário:', err);
        return res.status(500).json({ 
          message: 'Erro ao deletar usuário',
          error: 'DELETE_ERROR'
        });
      }
      
      res.json({ 
        message: 'Usuário deletado com sucesso',
        userId: id
      });
    });
  });
});

// Rota para listar equipamentos
app.get('/api/equipment', (req, res) => {
  db.query('SELECT * FROM equipment', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar equipamentos' });
    res.json(results);
  });
});

// Rota para adicionar equipamento
app.post('/api/equipment', (req, res) => {
  const { name, description, quantity } = req.body;
  db.query(
    'INSERT INTO equipment (name, description, quantity) VALUES (?, ?, ?)',
    [name, description, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erro ao adicionar equipamento' });
      res.status(201).json({ message: 'Equipamento adicionado com sucesso' });
    }
  );
});

// Rota para registrar entrada ou saída de estoque
app.post('/api/stock', (req, res) => {
  const { equipment_id, quantity, type, description } = req.body;
  
  // Validações básicas
  if (!equipment_id || !quantity || !type) {
    return res.status(400).json({ 
      message: 'Equipamento, quantidade e tipo são obrigatórios',
      error: 'MISSING_REQUIRED_FIELDS'
    });
  }
  
  // Verificar se o equipamento existe
  db.query('SELECT id, quantity FROM equipment WHERE id = ?', [equipment_id], (err, results) => {
    if (err) {
      console.error('Erro ao verificar equipamento:', err);
      return res.status(500).json({ 
        message: 'Erro ao verificar equipamento',
        error: 'DATABASE_ERROR'
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'Equipamento não encontrado',
        error: 'EQUIPMENT_NOT_FOUND'
      });
    }
    
    const equipment = results[0];
    
    // Verificar se há estoque suficiente para saída
    if (type === 'out' && equipment.quantity < quantity) {
      return res.status(400).json({ 
        message: 'Quantidade insuficiente em estoque',
        error: 'INSUFFICIENT_STOCK'
      });
    }
    
    // Registrar a movimentação
    db.query(
      'INSERT INTO stock_movements (equipment_id, quantity, type, description) VALUES (?, ?, ?, ?)',
      [equipment_id, quantity, type, description || ''],
      (err) => {
        if (err) {
          console.error('Erro ao registrar movimentação:', err);
          return res.status(500).json({ 
            message: 'Erro ao registrar movimentação',
            error: 'REGISTRATION_ERROR'
          });
        }

        // Atualizar a quantidade do equipamento
        const updateQuery =
          type === 'in'
            ? 'UPDATE equipment SET quantity = quantity + ? WHERE id = ?'
            : 'UPDATE equipment SET quantity = quantity - ? WHERE id = ?';

        db.query(updateQuery, [quantity, equipment_id], (err2) => {
          if (err2) {
            console.error('Erro ao atualizar quantidade:', err2);
            return res.status(500).json({ 
              message: 'Erro ao atualizar quantidade',
              error: 'UPDATE_ERROR'
            });
          }

          res.status(201).json({ 
            message: 'Movimentação registrada com sucesso',
            type: type
          });
        });
      }
    );
  });
});

// Rota para listar movimentações de estoque
app.get('/api/stock', (req, res) => {
  db.query(
    `SELECT sm.*, e.name AS equipment_name 
     FROM stock_movements sm 
     JOIN equipment e ON sm.equipment_id = e.id 
     ORDER BY sm.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao buscar movimentações' });
      res.json(results);
    }
  );
});

// Rota para deletar movimentação de estoque
app.delete('/api/stock/:id', (req, res) => {
  const { id } = req.params;
  
  // Primeiro, buscar a movimentação para obter os dados
  db.query('SELECT * FROM stock_movements WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar movimentação' });
    if (results.length === 0) return res.status(404).json({ message: 'Movimentação não encontrada' });
    
    const movement = results[0];
    
    // Inverter a quantidade para compensar a movimentação
    const quantity = movement.type === 'in' ? -movement.quantity : movement.quantity;
    
    // Atualizar a quantidade do equipamento
    db.query(
      'UPDATE equipment SET quantity = quantity + ? WHERE id = ?',
      [quantity, movement.equipment_id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Erro ao atualizar quantidade do equipamento' });
        
        // Deletar a movimentação
        db.query('DELETE FROM stock_movements WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ message: 'Erro ao deletar movimentação' });
          
          res.json({ message: 'Movimentação deletada com sucesso' });
        });
      }
    );
  });
});

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
