import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

interface BreadcrumbItem {
  label: string
  onClick?: () => void
  isActive?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff', borderRadius: 1 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {items.map((item, index) => (
          <Box key={index}>
            {item.isActive ? (
              <Typography
                sx={{
                  color: '#13AA52',
                  fontWeight: 'bold',
                  cursor: 'default',
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Link
                onClick={item.onClick}
                sx={{
                  cursor: 'pointer',
                  color: '#666',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#13AA52',
                  },
                }}
              >
                {item.label}
              </Link>
            )}
          </Box>
        ))}
      </Breadcrumbs>
    </Box>
  )
}
