export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'revision': '2023-10-15',
        'Authorization': `Klaviyo-API-Key ${process.env.KLAYIYO_API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            list_id: 'WdFqJp',
            profiles: {
              data: [
                {
                  type: 'profile',
                  attributes: {
                    email: email
                  }
                }
              ]
            }
          }
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ message: text });
    }

    return res.status(200).json({ message: 'Subscribed!' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
