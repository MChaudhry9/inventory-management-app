'use client';

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const backgroundStyle = {
  backgroundImage: 'url(/kitchenNew.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  width: '100vw',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: -1, // Ensures that the content is above the background image
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

  // to update the inventory
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  // to add into the inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  // to remove item from inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box style={backgroundStyle} display="flex" flexDirection="column" alignItems="center" p={3}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box
        bgcolor="white"
        borderRadius="16px"
        padding="20px"
        boxShadow="0px 4px 8px rgba(0,0,0,0.2)"
        mb={2}
      >
        <Typography variant={'h2'} color={'black'} textAlign={'center'}>
          Inventory Management System
        </Typography>
      </Box>
      {/* <Typography variant={'h2'} color={'black'} textAlign={'center'}>
        Inventory Management System
      </Typography> */}

      <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddIcon />}>
        Add New Item
      </Button>

      <Box
        width="800px"
        borderRadius="8px"
        overflow="hidden"
        boxShadow="0px 0px 10px rgba(0,0,0,0.1)"
        bgcolor="#fff"
        mt={2}
      >
        <Box
          width="100%"
          bgcolor={'#4a9dae'}
          color={'black'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          p={2}
        >
          <Typography variant={'h5'} textAlign={'center'}>
            Items in Stock
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} p={2} maxHeight="400px" overflow="auto">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f9f9f9'}
              p={2}
              borderRadius="4px"
              boxShadow="0px 0px 5px rgba(0,0,0,0.1)"
            >
              <Button variant="contained" color="primary" onClick={() => removeItem(name)} startIcon={<RemoveIcon />}>
                Remove
              </Button>
              <Typography variant={'h6'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Button variant="contained" color="primary" onClick={() => addItem(name)} startIcon={<AddIcon />}>
                Add
              </Button>
              <Typography variant={'h6'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

